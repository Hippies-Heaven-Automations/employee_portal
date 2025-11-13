import { Route } from "react-router-dom";
import GuestLayout from "@/components/layouts/GuestLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Hiring from "@/pages/Hiring";
import Login from "@/pages/Login";
import JobList from "@/pages/jobs/JobList";
import JobDetail from "@/pages/jobs/JobDetail";
import JobApplicationWizard from "@/pages/jobs/JobApplicationWizard";

const PublicRoutes = (
  <Route element={<GuestLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/hiring" element={<Hiring />} />
    <Route path="/login" element={<Login />} />

    <Route path="/jobs" element={<JobList />} />
    <Route path="/jobs/:id" element={<JobDetail />} />
    <Route path="/jobs/apply/:id" element={<JobApplicationWizard />} />
  </Route>
);

export default PublicRoutes;
