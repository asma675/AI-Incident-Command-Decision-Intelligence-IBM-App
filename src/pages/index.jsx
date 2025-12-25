import Layout from "./Layout.jsx";

import Analytics from "./Analytics";
import CreateIncident from "./CreateIncident";
import Dashboard from "./Dashboard";
import Governance from "./Governance";
import IncidentDetail from "./IncidentDetail";
import Predictions from "./Predictions";
import SystemHealth from "./SystemHealth";
import KnowledgeBase from "./KnowledgeBase";
import CreateArticle from "./CreateArticle";
import ArticleDetail from "./ArticleDetail";

import { Route, Routes, useLocation } from "react-router-dom";

const PAGES = {
  Analytics,
  CreateIncident,
  Dashboard,
  Governance,
  IncidentDetail,
  Predictions,
  SystemHealth,
  KnowledgeBase,
  CreateArticle,
  ArticleDetail,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) url = url.slice(0, -1);

  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) urlLastPart = urlLastPart.split("?")[0];

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );

  return pageName || "Analytics";
}

export default function Pages() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Analytics />} />

        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/CreateIncident" element={<CreateIncident />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Governance" element={<Governance />} />
        <Route path="/IncidentDetail" element={<IncidentDetail />} />
        <Route path="/Predictions" element={<Predictions />} />
        <Route path="/SystemHealth" element={<SystemHealth />} />
        <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
        <Route path="/CreateArticle" element={<CreateArticle />} />
        <Route path="/ArticleDetail" element={<ArticleDetail />} />
      </Routes>
    </Layout>
  );
}
