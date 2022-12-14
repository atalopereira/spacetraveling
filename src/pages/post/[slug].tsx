/* eslint-disable react/no-array-index-key */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from 'next/router';
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

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const formatDate = (date: string | null) =>
    format(new Date(date), 'd MMM yyyy', {
      locale: ptBR,
    });

  function calculateReadingTime(posts: Post) {
    const amountWords = posts.data.content.reduce((acc, currentValue) => {
      const headingWordsLength = currentValue.heading.split(' ').length;
      const bodyWordsLength = RichText.asText(currentValue.body).split(
        ' '
      ).length;

      return acc + headingWordsLength + bodyWordsLength;
    }, 0);

    return Math.ceil(amountWords / 200);
  }

  if (router.isFallback) {
    return (
      <div className={`${commonStyles.container} ${styles.loadingMessage}`}>
        Carregando...
      </div>
    );
  }

  return (
    <>
      <div>
        <img
          src={post.data.banner.url}
          alt="teste"
          className={styles.postImage}
        />
      </div>

      <main className={`${commonStyles.container} ${styles.postContainer}`}>
        <section className={styles.postHeader}>
          <h1>{post.data.title}</h1>
          <div>
            <div>
              <FiCalendar />
              <span>{formatDate(post.first_publication_date)}</span>
            </div>

            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>

            <div>
              <FiClock />
              <span>{`${calculateReadingTime(post)} min`}</span>
            </div>
          </div>
        </section>

        {post.data.content.map((content, index) => (
          <section key={index} className={styles.postContent}>
            <h1>{content.heading}</h1>
            {content.body.map((body, indexBody) => (
              <div
                key={indexBody}
                dangerouslySetInnerHTML={{ __html: body.text }}
              />
            ))}
          </section>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24,
  };
};
