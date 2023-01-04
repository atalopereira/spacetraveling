/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import Link from 'next/link';
import { useState } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiUser, FiCalendar } from 'react-icons/fi';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState({
    next_page: postsPagination.next_page,
    results: postsPagination.results,
  });

  function formatPostdate(postsData: Post[]): Post[] {
    const postsFormated = postsData.map(post => ({
      uid: post.uid,
      data: {
        title: post.data.title as string,
        subtitle: post.data.subtitle as string,
        author: post.data.author as string,
      },
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM yy',
        { locale: ptBR }
      ),
    }));

    return postsFormated;
  }

  function loadposts() {
    fetch(postsPagination.next_page)
      .then(response => {
        if (response.ok) {
          return response.json();
        }

        throw response;
      })
      .then(data => {
        const newPosts = {
          next_page: data.next_page,
          results: [...posts.results, ...formatPostdate(data.results)],
        };
        setPosts(newPosts);
      })
      .catch(error => {
        console.log('error fetching', error);
      });
  }
  return (
    <main className={`${commonStyles.container} ${styles.homeContainer}`}>
      {posts.results.map(post => (
        <Link key={post.uid} href={`/post/${post.uid}`}>
          <section className={styles.listPosts}>
            <h1>{post.data.title}</h1>
            <span>{post.data.subtitle}</span>
            <div>
              <div>
                <FiCalendar />
                <span>{post.first_publication_date}</span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </section>
        </Link>
      ))}

      {posts.next_page && (
        <span className={styles.loadPosts} onClick={loadposts}>
          Carregar mais posts
        </span>
      )}
    </main>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(currentPost => {
      return {
        uid: currentPost.uid,
        data: {
          title: currentPost.data.title as string,
          subtitle: currentPost.data.subtitle as string,
          author: currentPost.data.author as string,
        },
        first_publication_date: format(
          new Date(currentPost.first_publication_date),
          'd MMM yy',
          { locale: ptBR }
        ),
      };
    }),
  };

  return {
    props: { postsPagination },
  };
};
