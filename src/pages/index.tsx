import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FormatPosts } from './post/formatPosts';

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
      .get(nextPage)
      .then(({ data }) => {
        console.log(data.results);
        setNextPage(data.next_page);
        const nextPosts = FormatPosts(data.results);
        setPosts([...posts, ...nextPosts]);
      })
      .catch(error => {
        throw new Error(error);
      });
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
      <button
        onClick={handleLoadMore}
        className={nextPage ? '' : styles.disable}
        type="button"
      >
        <p>Carregar mais posts</p>
      </button>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', {
    pageSize: 1,
  });
  const results = FormatPosts(response.results);
  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results,
      },
    },
  };
};
