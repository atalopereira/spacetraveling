import { GetStaticPaths, GetStaticProps } from 'next';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

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

interface PostProps {
  post: Post;
}

export default function Post() {
  return (
    <main className={`${commonStyles.container} ${styles.postContainer}`}>
      <section className={styles.postHeader}>
        <h1>Criando um app CRA do zero</h1>
        <div>
          <div>
            <FiCalendar />
            <span>15 MAR 2021</span>
          </div>

          <div>
            <FiUser />
            <span>Josepth Oliveira</span>
          </div>

          <div>
            <FiClock />
            <span>4 min</span>
          </div>
        </div>
      </section>

      <section className={styles.postContent}>
        <h1>Poin et varius</h1>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.

          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
      </section>
    </main>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  console.log('response: ', response);

  return {
    props: {},
  };
};
