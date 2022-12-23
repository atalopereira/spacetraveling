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
    <main className={`${commonStyles.container} ${styles.homeContainer}`}>
      {postsPagination.results.map(post => (
        <section key={post.uid} className={styles.listPosts}>
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
      ))}

      {postsPagination.next_page && (
        <span className={styles.loadPosts}>Carregar mais posts</span>
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
