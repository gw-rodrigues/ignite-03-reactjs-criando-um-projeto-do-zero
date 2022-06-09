import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { FormatPosts } from './formatPosts';
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
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
                {post.first_publication_date}
              </time>
            </div>
            <div>
              <FiUser className={commonStyles.icon} />
              <p className={commonStyles.description}>{post.data.author}</p>
            </div>
            <div>
              <FiClock className={commonStyles.icon} />
              <p className={commonStyles.description}>4 min</p>
            </div>
          </div>
          {post.data.content.map(postContent => {
            return (
              <>
                <h2 className={styles.postHeading}>{postContent.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{ __html: postContent.body }}
                />
              </>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));
  const post = {
    first_publication_date: response.first_publication_date
      ? format(new Date(response.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR,
        })
      : null,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(({ heading, body }) => {
        return {
          heading,
          body: RichText.asHtml(body),
        };
      }),
    },
  };
  return {
    props: { post },
    redirect: 60 * 30,
  };
};
