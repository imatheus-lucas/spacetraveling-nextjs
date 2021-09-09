import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import styles from './post.module.scss';
import Header from '../../components/Header';
import Image from 'next/image';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
type Post = {
  title: string;
  subtitle: string;
  author: string;
  readingTime: string;
  first_publication_date: string | null;
  banner: {
    dimensions: { width: number; height: number };
    url: string;
  };
  contents: [
    {
      heading: string;
      description: string;
    }
  ];
};

type PostProps = {
  post: Post;
};

export default function Post({ post }: PostProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{post.title} | SpaceTraveling</title>
      </Head>

      <div className={styles.banner}>
        <img alt="banner" loading="lazy" src={post.banner.url} />
      </div>
      <div className={styles.content__container}>
        <section className={styles.content__details}>
          <h1>{post.title}</h1>
          <div>
            <div>
              <FiCalendar />
              <span>{post.first_publication_date}</span>
            </div>
            <div>
              <FiUser />
              <span>{post.author}</span>
            </div>
            <div>
              <FiClock />
              <span>{post.readingTime} </span>
            </div>
          </div>
        </section>
        <section className={styles.post}>
          {post.contents.map((content, index) => (
            <div key={index} className={styles.post__content}>
              <h3>{content.heading}</h3>
              <p>{content.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
export const getStaticPaths: GetStaticPaths = async () => {
  const { results } = await getPrismicClient().query(
    Prismic.Predicates.at('document.type', 'pos')
  );
  const paths = results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const { slug } = ctx.params!;

  const { data, first_publication_date } = await getPrismicClient().getByUID(
    'pos',
    slug as string,
    {}
  );

  const totalWords = data.contents.reduce(
    (totalContent: any, currentContent: any) => {
      const headingWords = currentContent.heading?.split(' ').length || 0;

      const bodyWords = currentContent.description.reduce(
        (totalBody: any, currentBody: any) => {
          const textWords = currentBody.text.split(' ').length;
          return totalBody + textWords;
        },
        0
      );

      return totalContent + headingWords + bodyWords;
    },
    0
  );

  const post: Post = {
    title: data.title[0].text,
    subtitle: data.subtitle,
    author: data.author,
    first_publication_date: format(
      parseISO(String(first_publication_date)),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    banner: {
      dimensions: {
        ...data.banner.dimensions,
      },
      url: data.banner.url,
    },
    contents: data.contents.map((content: any) => {
      return {
        heading: content.heading,
        description: content.description[0]?.text,
      };
    }),
    readingTime: `${Math.ceil(totalWords / 250)} min`,
  };

  //reading content time with reduce

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, //24 hours
  };
};
