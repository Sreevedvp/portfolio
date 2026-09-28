import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy, Download, FlaskConical, Package } from 'lucide-react';
import './experiments.css';

type DocPage = 'Overview' | 'Installation' | 'Components' | 'Theming' | 'Status';
const pages: DocPage[] = ['Overview', 'Installation', 'Components', 'Theming', 'Status'];
const assetRoot = `${import.meta.env.BASE_URL}experiments/fast-ui`;
const sourceUrl = `${assetRoot}/fast-ui-0.1.0.zip`;

const installSource = `# In your existing Dioxus 0.7.10 project
dx components add theme button field table dialog \\
  --path ../dioxus-complib \\
  --module-path src/ui`;
const installCrate = `[dependencies]
dioxus = { version = "0.7.10", features = ["web"] }
fast-ui = { path = "../dioxus-complib" }`;
const firstComponent = `use dioxus::prelude::*;
use fast_ui::{Button, Field, Input, Theme, ThemeStyles};

#[component]
fn App() -> Element {
    let mut name = use_signal(String::new);
    rsx! {
        ThemeStyles {}
        Theme {
            Field { id: "name", label: "Project name",
                Input {
                    value: name(),
                    on_value_change: move |value| name.set(value)
                }
            }
            Button { onclick: move |_| name.set(String::new()),
                "Start fresh"
            }
        }
    }
}`;

function CodeBlock({ title, code, language = 'Rust' }: { title: string; code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setCopied(false); setError(''); }, [code]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setError(''); }
    catch { setError('Copy is unavailable. Select the code below to copy it.'); }
  };
  return <div className="lab-code">
    <div className="lab-code-top"><span>{title}</span><div><small>{language}</small><button type="button" onClick={copy} aria-label={`Copy ${title}`}>{copied ? <Check size={13} /> : <Copy size={13} />}<span>{copied ? 'Copied' : 'Copy'}</span></button></div></div>
    <pre tabIndex={0} aria-label={title}><code>{code}</code></pre>
    <span className="sr-only" role="status">{copied ? `${title} copied.` : error}</span>
  </div>;
}

const examples = {
  Button: `Button {
    variant: ButtonVariant::Secondary,
    onclick: move |_| count += 1,
    "Count: {count}"
}`,
  'Field / Input': `Field { id: "email", label: "Email", hint: "Your work address.",
    Input {
        value: email(),
        on_value_change: move |value| email.set(value),
        input_type: "email",
        required: true
    }
}`,
  Table: `Table { caption: "Your projects",
    thead { tr { th { scope: "col", "Name" } } }
    tbody {
        for project in projects {
            tr { key: "{project.id}", td { "{project.name}" } }
        }
    }
}`,
  Dialog: `Dialog {
    id: "confirm-dialog",
    title: "Ready to continue?",
    open: open(),
    on_open_change: move |next| open.set(next),
    Button { onclick: move |_| open.set(false), "Done" }
}`,
};

export function Experiments() {
  const [page, setPage] = useState<DocPage>('Overview');
  const [method, setMethod] = useState<'source' | 'crate'>('source');
  const [example, setExample] = useState<keyof typeof examples>('Button');
  const [loaded, setLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  return <section id="experiments" className="portfolio-experiments" aria-labelledby="experiments-heading">
    <div className="lab-heading">
      <div><p className="lab-eyebrow"><FlaskConical size={13} /> THE EXPERIMENTAL SHELF</p><h2 id="experiments-heading">Small pieces.<br /><em>Open possibilities.</em></h2></div>
      <p>A space for things I’m building in the open. Useful ideas, working prototypes, and a few edges still being worked out.</p>
    </div>

    <div className="lab-project-banner">
      <div className="lab-project-title"><span className="lab-monogram" aria-hidden="true">f/ui</span><div><h3>Fast UI <span className="lab-experimental">Experimental</span></h3><p>A composable component library for Rust + Dioxus.</p></div></div>
      <a className="lab-download" href={sourceUrl} download><Download size={15} /> Get the source <ArrowUpRight size={13} /></a>
    </div>
    <div className="lab-meta"><span><i aria-hidden="true" /> VERSION 0.1.0</span><span>DIOXUS 0.7.10</span><span>EDITABLE SOURCE</span><span>WEB · WASM</span></div>

    <div className="lab-documentation" id="fast-ui-docs">
      <aside className="lab-docs-sidebar">
        <p>IN THIS EXPERIMENT</p>
        <nav aria-label="Fast UI documentation">{pages.map((item, i) => <button type="button" key={item} aria-pressed={page === item} onClick={() => setPage(item)}><span>0{i + 1}</span>{item}{page === item && <ArrowRight size={13} />}</button>)}</nav>
        <div className="lab-margin-note"><FlaskConical size={21} /><p>Built to be used.<br />Free to be changed.</p><small>The API is still evolving. Start with a small project.</small></div>
      </aside>

      <div className="lab-docs-content" aria-live="polite">
        {page === 'Overview' && <>
          <div className="lab-doc-heading"><span>THE IDEA</span><h3>Your components.<br />Your code.</h3><p>Fast UI takes the visual language of my FastMedium project and turns it into small, reusable Dioxus components. Install the pieces you need, then make them your own.</p></div>
          <div className="lab-preview-label"><span><i aria-hidden="true" /> LIVE PLAYGROUND</span><a href={`${assetRoot}/playground/index.html`} target="_blank" rel="noreferrer">Open full view <ArrowUpRight size={13} /></a></div>
          <div className="lab-preview">
            {showPreview ? <>
              {!loaded && <div className="lab-preview-loading"><Package size={22} /><span>Loading the Rust playground…</span><small>If it takes a moment, the full view is available above.</small></div>}
              <iframe title="Fast UI interactive Rust component playground" src={`${assetRoot}/playground/index.html`} loading="lazy" onLoad={() => setLoaded(true)} />
            </> : <button type="button" className="lab-load-preview" onClick={() => setShowPreview(true)}>Load the live playground <ArrowRight size={15} /></button>}
          </div>
          <p className="lab-preview-caption">Real components, compiled from Rust. Try the buttons, change the theme, or open a dialog. Everything stays in this preview. <button type="button" onClick={() => { setShowPreview(false); setLoaded(false); }}>Unload preview</button></p>
          <div className="lab-principles"><div><span>01 / OWN THE SOURCE</span><p>Copy components into your app, shadcn-style. No hidden application logic.</p></div><div><span>02 / BRING YOUR DATA</span><p>Your state, your routes, your backend. The library takes care of the interface.</p></div></div>
          <button type="button" className="lab-next" onClick={() => setPage('Installation')}><span><small>START BUILDING</small>Install your first component</span><ArrowRight size={20} /></button>
        </>}

        {page === 'Installation' && <>
          <div className="lab-doc-heading"><span>GETTING STARTED</span><h3>A small beginning.</h3><p>Download the source and extract the <code>dioxus-complib</code> folder next to your Dioxus application. This experimental release is a local source download, not a published crates.io package.</p></div>
          <a className="lab-inline-download" href={sourceUrl} download><Download size={16} /> Download Fast UI 0.1.0 <span>ZIP · Rust source</span></a>
          <div className="lab-callout"><strong>Before you start</strong><p>You’ll need Rust, the <code>wasm32-unknown-unknown</code> target, a Dioxus 0.7.10 app, and the matching <code>dx</code> CLI. The source archive includes a README and runnable examples.</p></div>
          <div className="lab-segmented" aria-label="Installation method"><button type="button" aria-pressed={method === 'source'} onClick={() => setMethod('source')}>Editable source</button><button type="button" aria-pressed={method === 'crate'} onClick={() => setMethod('crate')}>Cargo dependency</button></div>
          {method === 'source' ? <>
            <h4>Copy only what you need.</h4><p>The Dioxus CLI installs the selected files in <code>src/ui</code>. Include <code>theme</code> on the first install. Your Cargo dependencies stay under your control.</p>
            <CodeBlock title="Install components" language="Shell" code={installSource} />
            <CodeBlock title="Wire the modules" code={`mod ui;
use ui::button::Button;
use ui::field::{Field, Input};
use ui::theme::{Theme, ThemeStyles};`} />
            <p>Use these imports with the example below in place of <code>use fast_ui::…</code>. For updates, install into a temporary project and merge the diff; don’t overwrite customized source.</p>
          </> : <>
            <h4>Keep the library alongside your app.</h4><p>Use a local path dependency to share one implementation across projects. Adjust the path to match your folders.</p>
            <CodeBlock title="Cargo.toml" language="TOML" code={installCrate} />
          </>}
          <h4>Mount the theme once. Compose the rest.</h4><p><code>ThemeStyles</code> loads the component CSS; <code>Theme</code> scopes its tokens. The application owns every value and callback.</p>
          <CodeBlock title="Your first interface" code={firstComponent} />
          <CodeBlock title="Run your application" language="Shell" code="dx serve --web" />
        </>}

        {page === 'Components' && <>
          <div className="lab-doc-heading"><span>THE FIRST COLLECTION</span><h3>A few good foundations.</h3><p>These components are implemented today. They’re intentionally generic: no story models, account logic, or application routes travel with them.</p></div>
          <div className="lab-component-list">{[
            ['Theme', 'Scoped tokens, one stylesheet, and comfortable or compact spacing.'],
            ['Button', 'Four variants, three sizes, and disabled or loading states.'],
            ['Field / Input', 'Controlled values with connected labels, hints, and errors.'],
            ['Table', 'Semantic HTML, visible captions, and horizontal overflow.'],
            ['Dialog', 'Controlled modal state, keyboard support, and focus restoration.'],
          ].map(([name, description]) => <div key={name}><span className="lab-component-symbol" aria-hidden="true">{name === 'Theme' ? '◐' : name === 'Table' ? '▦' : name === 'Dialog' ? '▣' : name === 'Button' ? '↗' : '≡'}</span><div><h4>{name}</h4><p>{description}</p></div><span className="lab-available">Available</span></div>)}</div>
          <div className="lab-segmented" aria-label="Component example">{(Object.keys(examples) as (keyof typeof examples)[]).map(name => <button type="button" key={name} aria-pressed={example === name} onClick={() => setExample(name)}>{name}</button>)}</div>
          <p className="lab-example-note">Examples assume <code>use fast_ui::*;</code> and app-owned signals such as <code>let mut open = use_signal(|| false);</code>. Table rows come from your own data.</p>
          <CodeBlock title={`${example} example`} code={examples[example]} />
          <div className="lab-callout"><strong>Designed around browser semantics</strong><p>Buttons default to <code>type="button"</code>. Use <code>ButtonType::Submit</code> in forms. Give every Field and Dialog a stable, unique ID. Table accepts regular <code>thead</code>, <code>tbody</code>, and cell elements.</p></div>
        </>}

        {page === 'Theming' && <>
          <div className="lab-doc-heading"><span>MAKE IT YOURS</span><h3>A familiar starting point.<br />A different finish.</h3><p>Blush paper, coral actions, quiet borders. FastMedium’s visual language is the default—not a requirement. Override CSS variables within your theme.</p></div>
          <div className="lab-swatches">{[['Paper', '#fbe4e4'], ['Surface', '#fff3f0'], ['Coral', '#d34a45'], ['Action', '#ae3b36'], ['Ink', '#111111']].map(([name, color]) => <div key={name}><span style={{ background: color }} /><strong>{name}</strong><code>{color}</code></div>)}</div>
          <CodeBlock title="Choose your scope" code={`Theme { class: "my-theme", compact: true,
    Button { "A different project" }
}`} />
          <CodeBlock title="Your theme.css" language="CSS" code={`.fui-theme.my-theme {
  --fui-background: #eaf0e8;
  --fui-surface: #f5faf2;
  --fui-action: #355b3b;
  --fui-action-hover: #29472e;
  --fui-radius-control: 8px;
}`} />
          <h4>Typography is your choice.</h4><p>The defaults name Poppins for body text and Geist Mono for headings, with system fallbacks. Fonts aren’t fetched automatically. Load your own fonts or override <code>--fui-font-body</code> and <code>--fui-font-heading</code>.</p>
          <p>The CSS tokens can be used outside Dioxus. The Rust components themselves still require a compatible Dioxus application.</p>
        </>}

        {page === 'Status' && <>
          <div className="lab-doc-heading"><span>WORK IN PROGRESS</span><h3>An experiment.<br />With honest boundaries.</h3><p>This is a working first release, extracted into its own project. I’m using the components in FastMedium while refining the API and the installation experience.</p></div>
          <dl className="lab-status-table"><div><dt>Current release</dt><dd>0.1.0 · Experimental</dd></div><div><dt>Tested framework</dt><dd>Dioxus 0.7.10</dd></div><div><dt>Current target</dt><dd>Browser DOM / WebAssembly</dd></div><div><dt>Distribution</dt><dd>Local Cargo dependency or editable source</dd></div><div><dt>License metadata</dt><dd>MIT OR Apache-2.0</dd></div></dl>
          <h4>What’s been checked</h4><ul className="lab-checklist"><li>Rust component contracts and WASM builds</li><li>Clean source installation into an independent app</li><li>Keyboard navigation, nested dialogs, and focus restoration in Chrome</li><li>Responsive layouts, theme overrides, and FastMedium integration</li></ul>
          <h4>What comes next</h4><p>Popover and menus, drawers, toasts, more form controls, and a richer DataTable layer. Desktop WebViews, SSR hydration, screen-reader audits, and other browsers still need their own verification.</p>
          <div className="lab-callout"><strong>About version independence</strong><p>CSS tokens and your installed source belong to you. Dioxus APIs still change: future breaking releases need tested adapters and migrations. This release doesn’t claim universal framework compatibility.</p></div>
        </>}
      </div>
    </div>
    <div className="lab-footnote"><span>EXPERIMENT 001 / FAST UI</span><span>Useful now. Still becoming.</span><a href={sourceUrl} download>Take a look inside <ArrowUpRight size={12} /></a></div>
  </section>;
}
