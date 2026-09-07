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
import { CommandPalette } from './components/CommandPalette';
import { ProjectItem, ArticleItem } from './types';

export default function App() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const mainRef = useRef<HTMLElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isResumeOpen && !isContactOpen && !selectedProject && !selectedArticle) setIsPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isResumeOpen, isContactOpen, selectedProject, selectedArticle]);

  // Scroll spy for active section in navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'stack', 'work', 'visualizer', 'experience', 'writing'];
      const scrollPos = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Scroll Reveal for sections and cards
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    <div
      className="min-h-screen font-sans antialiased relative"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <a href="#main-content" className="skip-link">Skip to content</a>
      {/* Fixed Navigation Header */}
      <Navbar
        onOpenContact={() => setIsContactOpen(true)}
        activeSection={activeSection}
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      {/* Main portfolio content */}
      <main
        id="main-content"
        ref={mainRef}
        className="relative z-10 max-w-[1180px] mx-auto px-6 md:px-12 pt-28 pb-16 space-y-[100px] md:space-y-[120px]"
      >
        {/* Introduction and interactive WebGL experiment */}
        <Hero
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
        />

        {/* Technical Architecture & Projects */}
        <div className="scroll-reveal">
          <ProjectsWork onSelectProject={(p) => setSelectedProject(p)} />
        </div>

        {/* About Section */}
        <div className="scroll-reveal">
          <About />
        </div>

        {/* Core Stack Section */}
        <div className="scroll-reveal">
          <CoreStack />
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

      {/* Command Palette (⌘K) */}
      <CommandPalette
        onSelectProject={setSelectedProject}
        onSelectArticle={setSelectedArticle}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
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
