import type { NextPage } from "next";
import Head from "next/head";
import { GovernanceDashboard } from "../components/GovernanceDashboard";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title><%= projectName %> - Governance</title>
        <meta name="description" content="Governance DAO powered by Solana" />
      </Head>
      <GovernanceDashboard />
    </div>
  );
};

export default Home;
