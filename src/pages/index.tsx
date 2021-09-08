import type { GetServerSideProps, NextPage } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './home.module.scss';
import { getPrismicClient } from '../services/prismic';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';
import Link from 'next/link';
type DataProps = {
  uid: string;
  title: string;
  first_publication_date: string;
  author: string;
  subtitle: string;
};

type HomeProps = {
  data: Array<DataProps>;
};

const Home = ({ data }: HomeProps) => {
  return (
    <div className={styles.container}>
      <Header />
      {data.map((item, index) => {
        return (
          <Link key={index} href={`/post/${item.uid}`}>
            <div className={styles.post}>
              <h1>{item.title}</h1>
              <h5>{item.subtitle}</h5>
              <section className={styles.details}>
                <div>
                  <FiCalendar />
                  <span>{item.first_publication_date}</span>
                </div>
                <div>
                  <FiUser />
                  <span>{item.author}</span>
                </div>
              </section>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { results } = await getPrismicClient(ctx.req).query('');

  const data = results.map(result => {
    return {
      uid: result.uid,
      title: result.data.title[0].text,
      first_publication_date: format(
        parseISO(String(result.first_publication_date)),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      author: result.data.author,
      subtitle: result.data.subtitle,
    };
  });

  return {
    props: {
      data,
    },
  };
};
