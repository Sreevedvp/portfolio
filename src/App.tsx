/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { CoreStack } from './components/CoreStack';
import { ProjectsWork } from './components/ProjectsWork';
import { InteractiveD3Showcase } from './components/InteractiveD3Showcase';
import { Experience } from './components/Experience';
import { Writing } from './components/Writing';
import { Footer } from './components/Footer';
import { ResumeModal } from './components/ResumeModal';
import { ContactModal } from './components/ContactModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ArticleModal } from './components/ArticleModal';
import { ProjectItem, ArticleItem } from './types';

export default function App() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [activeSection, setActiveSection] = useState('work');

  const mainRef = useRef<HTMLElement>(null);

  // Scroll spy for active section in navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'stack', 'work', 'visualizer', 'experience', 'writing'];
      const scrollPos = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Scroll Reveal for sections and cards
  useEffect(() => {
    const ctx = gsap.context(() => {
      const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                clearProps: 'transform,opacity',
              }
            );
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const revealElements = document.querySelectorAll('.scroll-reveal');
      revealElements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4fbf4] text-[#161d19] font-sans antialiased selection:bg-[#8cf5b2] selection:text-[#004c22]">
      {/* Fixed Navigation Header */}
      <Navbar
        onOpenContact={() => setIsContactOpen(true)}
        activeSection={activeSection}
      />

      {/* Main Container matching the 900px centered editorial layout */}
      <main
        ref={mainRef}
        className="max-w-[900px] mx-auto px-6 md:px-12 pt-28 pb-16 space-y-[100px] md:space-y-[120px]"
      >
        {/* Hero Section with GSAP 3D Emerald Gemstone */}
        <Hero
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
        />

        {/* About Section */}
        <div className="scroll-reveal">
          <About />
        </div>

        {/* Core Stack Section */}
        <div className="scroll-reveal">
          <CoreStack />
        </div>

        {/* Technical Architecture & Projects */}
        <div className="scroll-reveal">
          <ProjectsWork onSelectProject={(p) => setSelectedProject(p)} />
        </div>

        {/* Interactive Real-time D3 Engine Demonstration */}
        <div className="scroll-reveal">
          <InteractiveD3Showcase />
        </div>

        {/* Experience Timeline */}
        <div className="scroll-reveal">
          <Experience />
        </div>

        {/* Writing Articles */}
        <div className="scroll-reveal">
          <Writing onSelectArticle={(a) => setSelectedArticle(a)} />
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenContact={() => setIsContactOpen(true)}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      {/* Modals & Overlays */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        onOpenContact={() => {
          setIsResumeOpen(false);
          setIsContactOpen(true);
        }}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
