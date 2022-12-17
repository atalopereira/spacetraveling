import { GetStaticProps } from 'next';

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
  console.log('postsResponse: ', postsPagination);
  return (
    <main className={styles.container}>
      {postsPagination.results.map(post => (
        <section key={post.uid} className={styles.listPosts}>
          <h1>{post.data.title}</h1>
          <span>{post.data.subtitle}</span>
          <div>
            <div>
              <FiCalendar />
              <span>15 Mar 2021</span>
            </div>
            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
          </div>
        </section>
      ))}

      <span className={styles.loadPosts}>Carregar mais posts</span>
    </main>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  // const postsPagination = {
  //   next_page: postsResponse.next_page,
  //   results: postsResponse.results.map(currentPost => {
  //     return {
  //       ...currentPost,
  //       first_publication_date: format(
  //         Number(currentPost.first_publication_date),
  //         "'Hoje é' eeee",
  //         { locale: ptBR }
  //       ),
  //     };
  //   }),
  // };

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  console.log('postsResponse: ', postsResponse);

  return {
    props: { postsPagination },
  };
};
