import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import * as prismicH from '@prismicio/helpers';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostNav {
  title: string;
  slug: string;
}

interface PostProps {
  post: Post;
  prev_page: PostNav;
  next_page: PostNav;
}

export default function Post({
  post,
  prev_page,
  next_page,
}: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Carregando...</h1>
      </main>
    );
  }
  return (
    <>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>
      <main className={styles.container}>
        <article className={styles.content}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <div>
              <FiCalendar className={commonStyles.icon} />
              <time className={commonStyles.description}>
                {post.first_publication_date
                  ? format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )
                  : null}
              </time>
            </div>
            <div>
              <FiUser className={commonStyles.icon} />
              <p className={commonStyles.description}>{post.data.author}</p>
            </div>
            <div>
              <FiClock className={commonStyles.icon} />
              <p className={commonStyles.description}>
                {post.data.content.reduce((acc, { heading, body }) => {
                  const numberWords = [
                    ...heading.split(/\s+/),
                    ...RichText.asText(body).split(/\s+/),
                  ];
                  return acc + Math.ceil(numberWords.length / 200);
                }, 0)}
                {' min'}
              </p>
            </div>
          </div>
          {post.data.content.map(({ heading, body }) => {
            return (
              <div key={heading}>
                <h2 className={styles.postHeading}>{heading}</h2>
                <div
                  className={styles.postContent}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(body),
                  }}
                />
              </div>
            );
          })}
        </article>
        <hr />
        <section className={styles.postNav}>
          <div>
            <p>- Como utilizar Hooks</p>
            <Link href="/post/como-utilizar-hooks">
              <button type="button">
                <p>Post anterior</p>
              </button>
            </Link>
          </div>
          <div>
            <p>- Criando um app CRA do zero</p>
            <Link href="/post/como-utilizar-hooks">
              <button type="button">
                <p>Proximo post</p>
              </button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async params => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts');
  if (!response) {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
  const paths = response.results.map(doc => ({
    params: {
      slug: prismicH.asLink(doc, post => post.uid),
    },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const post = await prismic.getByUID('posts', String(params.slug), {
    after: '1',
  });
  return {
    props: {
      post,
    },
    redirect: 60 * 30,
  };
};
