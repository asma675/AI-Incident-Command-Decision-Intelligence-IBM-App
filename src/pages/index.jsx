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

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Analytics: Analytics,
    
    CreateIncident: CreateIncident,
    
    Dashboard: Dashboard,
    
    Governance: Governance,
    
    IncidentDetail: IncidentDetail,
    
    Predictions: Predictions,
    
    SystemHealth: SystemHealth,
    
    KnowledgeBase: KnowledgeBase,
    
    CreateArticle: CreateArticle,
    
    ArticleDetail: ArticleDetail,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
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

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}