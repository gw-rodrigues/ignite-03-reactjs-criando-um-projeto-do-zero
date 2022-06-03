import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useState } from 'react';
import axios from 'axios';
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

function formatResults(posts): Post[] {
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
  function handleLoadMore(): void {
    if (!nextPage) {
      return;
    }
    axios
      .get(next_page)
      .then(({ data }) => {
        setNextPage(data.next_page);
        const nextPosts = formatResults(data.results);
        setPosts([...posts, ...nextPosts]);
      })
      .catch(error => {
        console.log(error);
      });
  }

  return (
    <main className={styles.container}>
      {posts.map(post => (
        <article key={post.uid} className={styles.content}>
          <header>
            <a href={`/post/${post.uid}`} className={styles.title}>
              <h1>{post.data.title}</h1>
            </a>
          </header>
          <p className={styles.subtitle}>{post.data.subtitle}</p>
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
          </div>
        </article>
      ))}
      <button onClick={handleLoadMore} type="button">
        <p>Carregar mais posts</p>
      </button>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', {
    pageSize: 3,
  });
  const results = formatResults(response.results);
  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results,
      },
    },
  };
};
