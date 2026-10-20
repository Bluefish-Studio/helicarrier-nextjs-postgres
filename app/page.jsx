import { readBoard } from "../lib/database.mjs";
export const dynamic = "force-dynamic";

export default async function Home() {
  let launches = [], connected = false;
  try { launches = await readBoard(); connected = true; } catch { /* Render a useful setup state without exposing errors or credentials. */ }
  return <main>
    <nav><a href="https://helicarrier.cloud/">Helicarrier <span>/ examples</span></a><span className="pill">Next.js + PostgreSQL</span></nav>
    <header><p className="eyebrow">A SMALL IDEA, RUNNING.</p><h1>Your next launch.<br/><span>One step closer.</span></h1><p className="lead">A tiny launch board backed by a real database. Deploy it, connect the pieces, and make it your own.</p></header>
    <section className="board" aria-label="Sample launch board">
      <div className="board-heading"><h2>Launch board</h2><span className={`connection ${connected ? "online" : ""}`}>{connected ? "PostgreSQL connected" : "Setup needed"}</span></div>
      {connected ? <><div className="table-wrap"><table><thead><tr><th>What’s next</th><th>Part of the stack</th><th>Status</th></tr></thead><tbody>{launches.map(item => <tr key={item.id}><th scope="row">{item.title}</th><td>{item.category}</td><td><span className={`state ${item.state.toLowerCase()}`}>{item.state}</span></td></tr>)}</tbody></table></div><p className="note">Sample records from your database. Refresh to read them again.</p></> : <div className="setup"><h3>Connect your database, then run the migration.</h3><p>Set the server’s <code>DATABASE_URL</code> and run <code>npm run db:migrate</code>. If you already did, check that the database is running and the service reference is applied.</p><a href="https://helicarrier.cloud/docs/networking/references/">Read the connection guide →</a></div>}
    </section>
    <section className="steps" aria-label="How the example works"><div><span>01</span><h3>Build from Git.</h3><p>The Dockerfile builds a standalone Next.js server. No database credentials are needed during the build.</p></div><div><span>02</span><h3>Connect privately.</h3><p>A server-side environment variable connects your app to PostgreSQL. The browser never receives the connection string.</p></div><div><span>03</span><h3>Release with a schema.</h3><p>The migration creates this board and sample records. Re-running it keeps the existing data intact.</p></div></section>
    <footer><span>A learning example. All displayed records are fictional.</span><a href="https://helicarrier.cloud/docs/">Build with Helicarrier ↗</a></footer>
  </main>;
}
