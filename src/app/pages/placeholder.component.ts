import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-blue-theme-demo',
  standalone: true,
  template: `
    <div class="app-shell">
      <header class="top-bar">
        <div class="top-left">
          <div class="logo-dot"></div>
          <div class="app-title">
            <div class="app-title-main">Blue System Demo</div>
            <div class="app-title-sub">All tokens · All states · Light & Dark</div>
          </div>
        </div>
        <div class="top-right">
          <span class="theme-label">Theme: {{ isDark ? 'Dark' : 'Light' }}</span>
          <button class="btn-outline small" (click)="toggleTheme()">
            Toggle Theme
          </button>
        </div>
      </header>

      <main class="layout">
        <!-- LEFT COLUMN: COLORS & TEXT -->
        <section class="panel">
          <h2 class="panel-title">Background Layers</h2>
          <div class="swatch-row">
            <div class="swatch" style="background: var(--bg-1);">
              <span class="swatch-label">bg-1</span>
            </div>
            <div class="swatch" style="background: var(--bg-2);">
              <span class="swatch-label">bg-2</span>
            </div>
            <div class="swatch" style="background: var(--bg-3);">
              <span class="swatch-label">bg-3</span>
            </div>
            <div class="swatch" style="background: var(--bg-4);">
              <span class="swatch-label">bg-4</span>
            </div>
            <div class="swatch" style="background: var(--bg-5);">
              <span class="swatch-label">bg-5</span>
            </div>
          </div>

          <h2 class="panel-title secondary">Text Levels</h2>
          <div class="text-levels">
            <p class="text-sample text-1">Text 1 – Primary heading / most important</p>
            <p class="text-sample text-2">Text 2 – Secondary title or strong label</p>
            <p class="text-sample text-3">Text 3 – Body text default</p>
            <p class="text-sample text-4">Text 4 – Muted info, helper text</p>
            <p class="text-sample text-5">Text 5 – Disabled, very subtle hints</p>
          </div>

          <h2 class="panel-title secondary">Semantic Colors</h2>
          <div class="semantic-row">
            <div class="semantic-pill semantic-success">
              Success · var(--success)
            </div>
            <div class="semantic-pill semantic-warning">
              Warning · var(--warning)
            </div>
            <div class="semantic-pill semantic-error">
              Error · var(--error)
            </div>
          </div>

          <h2 class="panel-title secondary">Borders & Shadows</h2>
          <div class="shadow-grid">
            <div class="shadow-card border-1 shadow-sm-demo">
              <div class="shadow-title">Border 1 · Shadow SM</div>
              <div class="shadow-sub">Subtle separation, small elevation</div>
            </div>
            <div class="shadow-card border-2 shadow-md-demo">
              <div class="shadow-title">Border 2 · Shadow MD</div>
              <div class="shadow-sub">Used for main cards / sections</div>
            </div>
            <div class="shadow-card border-2 shadow-lg-demo">
              <div class="shadow-title">Border 2 · Shadow LG</div>
              <div class="shadow-sub">Used for modals / overlays</div>
            </div>
          </div>
        </section>

        <!-- RIGHT COLUMN: COMPONENTS -->
        <section class="panel">
          <h2 class="panel-title">Buttons</h2>
          <div class="button-grid">
            <button class="btn-primary">Primary Button</button>
            <button class="btn-primary" disabled>Primary Disabled</button>
            <button class="btn-subtle">Subtle Button</button>
            <button class="btn-outline">Outline Button</button>
            <button class="btn-ghost">Ghost Button</button>
          </div>

          <h2 class="panel-title secondary">Selection / Chips</h2>
          <div class="chip-row">
            <div class="chip">Default chip</div>
            <div class="chip chip-selected">Selected chip</div>
            <div class="chip chip-ghost">Ghost chip</div>
          </div>

          <h2 class="panel-title secondary">Card & Content</h2>
          <div class="card-demo shadow-md-demo">
            <div class="card-header">
              <div class="card-title">Analytics Overview</div>
              <div class="card-subtitle">Card using bg-3, border-1, shadow-md</div>
            </div>
            <div class="card-body">
              <div class="stats-row">
                <div class="stat-box">
                  <div class="stat-label">Active Users</div>
                  <div class="stat-value">1,284</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Conversion</div>
                  <div class="stat-value accent">4.2%</div>
                </div>
              </div>
              <div class="progress-row">
                <div class="progress-label">Deployment Progress</div>
                <div class="progress-track">
                  <div class="progress-bar" style="width: 68%;"></div>
                </div>
              </div>
            </div>
          </div>

          <h2 class="panel-title secondary">Form / Inputs</h2>
          <form class="form-grid" (submit)="$event.preventDefault()">
            <div class="form-field">
              <label class="form-label">Name</label>
              <input class="input" placeholder="Enter your name" />
            </div>
            <div class="form-field">
              <label class="form-label">Email</label>
              <input class="input" type="email" placeholder="name@example.com" />
            </div>
            <div class="form-field full">
              <label class="form-label">Notes</label>
              <textarea class="input textarea" rows="3"
                placeholder="Type something to see long text contrast..."></textarea>
              <div class="form-helper text-4">
                Uses bg-2, border-1, text-3/4 and focus outline with blue.
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-primary small" type="submit">Submit</button>
              <button class="btn-ghost small" type="button">Cancel</button>
            </div>
          </form>

          <h2 class="panel-title secondary">Alerts</h2>
          <div class="alert alert-success">
            <div class="alert-title">Success</div>
            <div class="alert-body">
              Action completed successfully. Styled with var(--success).
            </div>
          </div>
          <div class="alert alert-warning">
            <div class="alert-title">Warning</div>
            <div class="alert-body">
              Check these values again. Styled with var(--warning).
            </div>
          </div>
          <div class="alert alert-error">
            <div class="alert-title">Error</div>
            <div class="alert-body">
              Something went wrong. Styled with var(--error).
            </div>
          </div>

          <h2 class="panel-title secondary">Table Example</h2>
          <div class="table-wrapper shadow-sm-demo">
            <table class="demo-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Users</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Starter</td>
                  <td>120</td>
                  <td><span class="chip chip-soft success-soft">Active</span></td>
                  <td><button class="btn-subtle small">Manage</button></td>
                </tr>
                <tr>
                  <td>Growth</td>
                  <td>892</td>
                  <td><span class="chip chip-soft warning-soft">Trial ending</span></td>
                  <td><button class="btn-outline small">Upgrade</button></td>
                </tr>
                <tr>
                  <td>Enterprise</td>
                  <td>34</td>
                  <td><span class="chip chip-soft error-soft">Attention</span></td>
                  <td><button class="btn-primary small">View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: background 0.2s ease, color 0.2s ease;
    }

    /* ================================
       LIGHT THEME VARIABLES
       ================================ */
    :host.light {
      /* SURFACES (Background layers) */
      --bg-1: oklch(0.97 0.02 240);
      --bg-2: oklch(0.94 0.025 240);
      --bg-3: oklch(0.90 0.03 240);
      --bg-4: oklch(0.86 0.035 240);
      --bg-5: oklch(0.82 0.045 240);

      /* TEXT (Strong → Muted) */
      --text-1: oklch(0.18 0.03 240);
      --text-2: oklch(0.30 0.025 240);
      --text-3: oklch(0.42 0.02 240);
      --text-4: oklch(0.55 0.018 240);
      --text-5: oklch(0.66 0.015 240);

      /* BRAND / BUTTON BLUE (Primary) */
      --blue-1: oklch(0.63 0.18 240);
      --blue-2: oklch(0.58 0.15 240);
      --blue-3: oklch(0.52 0.12 240);

      /* SEMANTIC COLORS */
      --success: oklch(0.70 0.12 170);
      --warning: oklch(0.82 0.12 85);
      --error:   oklch(0.65 0.16 30);

      /* BORDERS */
      --border-1: oklch(0.82 0.01 240);
      --border-2: oklch(0.72 0.015 240);

      /* SHADOWS */
      --shadow-sm: 0 1px 2px oklch(0.55 0.03 240 / 0.22);
      --shadow-md: 0 4px 12px oklch(0.50 0.03 240 / 0.18);
      --shadow-lg: 0 12px 32px oklch(0.45 0.04 240 / 0.16);
    }

    /* ================================
       DARK THEME VARIABLES
       ================================ */
    :host.dark {
      /* SURFACES (Background layers) */
      --bg-1: oklch(0.13 0.02 240);
      --bg-2: oklch(0.17 0.025 240);
      --bg-3: oklch(0.22 0.03 240);
      --bg-4: oklch(0.28 0.035 240);
      --bg-5: oklch(0.34 0.045 240);

      /* TEXT (Strong → Muted) */
      --text-1: oklch(0.92 0.03 240);
      --text-2: oklch(0.80 0.025 240);
      --text-3: oklch(0.72 0.02 240);
      --text-4: oklch(0.64 0.018 240);
      --text-5: oklch(0.56 0.015 240);

      /* BRAND / BUTTON BLUE */
      --blue-1: oklch(0.72 0.18 240);
      --blue-2: oklch(0.68 0.15 240);
      --blue-3: oklch(0.62 0.12 240);

      /* SEMANTIC COLORS */
      --success: oklch(0.78 0.12 170);
      --warning: oklch(0.75 0.12 85);
      --error:   oklch(0.72 0.16 30);

      /* BORDERS */
      --border-1: oklch(0.32 0.01 240);
      --border-2: oklch(0.42 0.015 240);

      /* SHADOWS (softer, more glow) */
      --shadow-sm: 0 1px 2px oklch(0.05 0.04 240 / 0.45);
      --shadow-md: 0 4px 18px oklch(0.05 0.04 240 / 0.38);
      --shadow-lg: 0 12px 42px oklch(0.05 0.04 240 / 0.32);
    }

    /* ================================
       GLOBAL LAYOUT USING TOKENS
       ================================ */

    .app-shell {
      background: var(--bg-1);
      color: var(--text-1);
      padding: 1.25rem 1.5rem 2.5rem;
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
      background: var(--bg-2);
      border: 1px solid var(--border-1);
      box-shadow: var(--shadow-sm);
      margin-bottom: 1.5rem;
    }

    .top-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-dot {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 20%, var(--blue-1), var(--blue-3));
      box-shadow: var(--shadow-md);
    }

    .app-title-main {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-1);
    }

    .app-title-sub {
      font-size: 0.78rem;
      color: var(--text-4);
    }

    .top-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .theme-label {
      font-size: 0.8rem;
      color: var(--text-3);
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.3fr);
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .panel {
      background: var(--bg-2);
      border-radius: 1.1rem;
      padding: 1.25rem 1.25rem 1.5rem;
      border: 1px solid var(--border-1);
      box-shadow: var(--shadow-sm);
    }

    .panel-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-1);
      margin-bottom: 0.85rem;
    }

    .panel-title.secondary {
      margin-top: 1.25rem;
    }

    /* ================================
       BACKGROUND SWATCHES
       ================================ */

    .swatch-row {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 0.5rem;
    }

    .swatch {
      position: relative;
      height: 52px;
      border-radius: 0.9rem;
      border: 1px solid var(--border-1);
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
      padding: 0.35rem 0.5rem;
      box-shadow: var(--shadow-sm);
    }

    .swatch-label {
      font-size: 0.7rem;
      color: var(--text-4);
      background: color-mix(in oklch, var(--bg-1) 70%, transparent);
      padding: 0.1rem 0.4rem;
      border-radius: 999px;
      border: 1px solid var(--border-1);
    }

    /* ================================
       TEXT LEVELS
       ================================ */

    .text-levels {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.35rem;
    }

    .text-sample {
      margin: 0;
      font-size: 0.85rem;
    }

    .text-1 { color: var(--text-1); font-weight: 600; }
    .text-2 { color: var(--text-2); font-weight: 500; }
    .text-3 { color: var(--text-3); }
    .text-4 { color: var(--text-4); font-size: 0.82rem; }
    .text-5 { color: var(--text-5); font-size: 0.8rem; font-style: italic; }

    /* ================================
       SEMANTIC COLORS
       ================================ */

    .semantic-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .semantic-pill {
      border-radius: 999px;
      padding: 0.3rem 0.7rem;
      font-size: 0.78rem;
      border: 1px solid var(--border-1);
      background: var(--bg-3);
    }

    .semantic-success { color: var(--success); }
    .semantic-warning { color: var(--warning); }
    .semantic-error   { color: var(--error); }

    /* ================================
       SHADOW / BORDER DEMOS
       ================================ */

    .shadow-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.6rem;
      margin-top: 0.35rem;
    }

    @media (max-width: 900px) {
      .shadow-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .shadow-card {
      border-radius: 0.9rem;
      padding: 0.6rem 0.7rem;
      background: var(--bg-3);
    }

    .border-1 { border: 1px solid var(--border-1); }
    .border-2 { border: 1px solid var(--border-2); }

    .shadow-sm-demo { box-shadow: var(--shadow-sm); }
    .shadow-md-demo { box-shadow: var(--shadow-md); }
    .shadow-lg-demo { box-shadow: var(--shadow-lg); }

    .shadow-title {
      font-size: 0.8rem;
      color: var(--text-2);
      font-weight: 500;
    }

    .shadow-sub {
      font-size: 0.75rem;
      color: var(--text-4);
      margin-top: 0.1rem;
    }

    /* ================================
       BUTTONS
       ================================ */

    .button-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }

    button {
      font-family: inherit;
      border-radius: 999px;
      padding: 0.45rem 0.95rem;
      font-size: 0.8rem;
      border: none;
      cursor: pointer;
      transition: background 0.16s ease, box-shadow 0.16s ease, transform 0.08s ease, border-color 0.16s ease, color 0.16s ease;
      outline: none;
      white-space: nowrap;
    }

    button.small {
      padding: 0.33rem 0.8rem;
      font-size: 0.78rem;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      box-shadow: none;
      transform: none;
    }

    .btn-primary {
      background: var(--blue-1);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--blue-2);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .btn-subtle {
      background: var(--bg-4);
      color: var(--text-1);
      border: 1px solid var(--border-1);
      box-shadow: var(--shadow-sm);
    }

    .btn-subtle:hover:not(:disabled) {
      background: var(--bg-5);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: var(--blue-1);
      border: 1px solid var(--blue-3);
    }

    .btn-outline:hover:not(:disabled) {
      background: var(--bg-3);
      box-shadow: var(--shadow-sm);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-2);
    }

    .btn-ghost:hover:not(:disabled) {
      background: var(--bg-3);
    }

    /* ================================
       CHIPS / SELECTION
       ================================ */

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
    }

    .chip {
      padding: 0.23rem 0.7rem;
      border-radius: 999px;
      font-size: 0.78rem;
      background: var(--bg-3);
      border: 1px solid var(--border-1);
      color: var(--text-3);
    }

    .chip-selected {
      background: var(--blue-3);
      color: white;
      box-shadow: var(--shadow-sm);
      border-color: transparent;
    }

    .chip-ghost {
      background: transparent;
      border-style: dashed;
    }

    .chip-soft {
      font-size: 0.75rem;
      padding: 0.17rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--border-1);
      background: var(--bg-3);
    }

    .success-soft { color: var(--success); }
    .warning-soft { color: var(--warning); }
    .error-soft   { color: var(--error); }

    /* ================================
       CARD / CONTENT
       ================================ */

    .card-demo {
      margin-top: 0.4rem;
      background: var(--bg-3);
      border-radius: 1rem;
      border: 1px solid var(--border-1);
      padding: 0.85rem 0.9rem;
    }

    .card-header {
      margin-bottom: 0.55rem;
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-1);
    }

    .card-subtitle {
      font-size: 0.78rem;
      color: var(--text-4);
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.6rem;
    }

    @media (max-width: 900px) {
      .stats-row {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .stat-box {
      background: var(--bg-4);
      border-radius: 0.8rem;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--border-1);
    }

    .stat-label {
      font-size: 0.76rem;
      color: var(--text-4);
    }

    .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-1);
    }

    .stat-value.accent {
      color: var(--blue-1);
    }

    .progress-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .progress-label {
      font-size: 0.78rem;
      color: var(--text-3);
    }

    .progress-track {
      width: 100%;
      height: 9px;
      border-radius: 999px;
      background: var(--bg-4);
      border: 1px solid var(--border-1);
      box-shadow: inset 0 1px 2px oklch(0.18 0.02 240 / 0.35);
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(to right, var(--blue-2), var(--blue-1));
      box-shadow: var(--shadow-sm);
    }

    /* ================================
       FORMS / INPUTS
       ================================ */

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.65rem 0.8rem;
      margin-top: 0.4rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .form-field.full {
      grid-column: 1 / -1;
    }

    .form-label {
      font-size: 0.78rem;
      color: var(--text-2);
      font-weight: 500;
    }

    .input {
      border-radius: 0.7rem;
      border: 1px solid var(--border-1);
      padding: 0.4rem 0.65rem;
      font-size: 0.82rem;
      background: var(--bg-2);
      color: var(--text-1);
      outline: none;
      transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
      resize: vertical;
    }

    .input::placeholder {
      color: var(--text-5);
    }

    .input:focus {
      border-color: var(--blue-2);
      box-shadow: 0 0 0 1px var(--blue-2);
      background: var(--bg-3);
    }

    .textarea {
      min-height: 70px;
    }

    .form-helper {
      margin-top: 0.15rem;
      font-size: 0.75rem;
    }

    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.3rem;
    }

    /* ================================
       ALERTS
       ================================ */

    .alert {
      border-radius: 0.8rem;
      padding: 0.55rem 0.7rem;
      margin-top: 0.45rem;
      border: 1px solid var(--border-1);
      background: var(--bg-3);
    }

    .alert-title {
      font-size: 0.78rem;
      font-weight: 600;
    }

    .alert-body {
      font-size: 0.78rem;
      margin-top: 0.1rem;
      color: var(--text-3);
    }

    .alert-success .alert-title { color: var(--success); }
    .alert-warning .alert-title { color: var(--warning); }
    .alert-error   .alert-title { color: var(--error); }

    /* ================================
       TABLE
       ================================ */

    .table-wrapper {
      margin-top: 0.4rem;
      background: var(--bg-3);
      border-radius: 0.9rem;
      border: 1px solid var(--border-1);
      overflow: hidden;
    }

    .demo-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.78rem;
    }

    .demo-table thead {
      background: var(--bg-4);
    }

    .demo-table th,
    .demo-table td {
      padding: 0.45rem 0.6rem;
      text-align: left;
      border-bottom: 1px solid var(--border-1);
    }

    .demo-table th {
      font-weight: 500;
      color: var(--text-2);
    }

    .demo-table tbody tr:last-child td {
      border-bottom: none;
    }

    .demo-table tbody tr:hover {
      background: var(--bg-5);
    }
  `]
})
export class PlaceholderComponent {
  @HostBinding('class') hostClass: 'light' | 'dark' = 'light';

  get isDark(): boolean {
    return this.hostClass === 'dark';
  }

  toggleTheme(): void {
    this.hostClass = this.hostClass === 'light' ? 'dark' : 'light';
  }
}
