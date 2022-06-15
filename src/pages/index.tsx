import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { PrismicDocument } from '@prismicio/types';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function FormatPosts(posts: PrismicDocument[]): Post[] {
  return posts.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date
        ? format(new Date(post.first_publication_date), 'dd MMM yyyy', {
            locale: ptBR,
          })
        : null,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
}

export default function Posts({
  postsPagination: { next_page, results },
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState<string | null>(next_page);
  const [isLoading, setIsloading] = useState(false);

  async function handleLoadMore(): Promise<Post> {
    if (!nextPage) {
      return;
    }
    setIsloading(true);

    await fetch(nextPage)
      .then(res => res.json())
      .then(post => {
        setNextPage(post.next_page);
        setPosts([...posts, ...post.results]);
      })
      .catch(err => {
        throw new Error(err);
      })
      .finally(() => setIsloading(false));
  }
  return (
    <main className={styles.container}>
      {posts.map(post => (
        <article key={post.uid} className={styles.content}>
          <Link href={`/post/${post.uid}`}>
            <a className={styles.title}>
              <h1>{post.data.title}</h1>
            </a>
          </Link>
          <p className={styles.subtitle}>{post.data.subtitle}</p>
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
          </div>
        </article>
      ))}
      {nextPage && (
        <button
          onClick={handleLoadMore}
          className={isLoading ? styles.disable : null}
          type="button"
          disabled={!!isLoading}
        >
          <p>{isLoading ? 'Carregando...' : 'Carregar mais posts'}</p>
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', {
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
    pageSize: 1,
  });
  // console.log(JSON.stringify(response.results[0].data, null, 2));
  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: response.results,
      },
    },
  };
};
