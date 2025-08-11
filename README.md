# HR Interview Data Analysis Dashboard

An interactive **data analysis dashboard** built with **React** and **TailwindCSS**, developed as part of the **SK Group MySUNI 4th Cohort** project.  
This dashboard was specifically designed for **SK Enmove HR managers** to efficiently analyze and visualize employee interview data, enabling data-driven decision-making in talent management.

---

## Features

- **File Upload** – Import Excel or CSV files containing interview data.
- **Interactive Filtering** – Filter results by job role and years of experience.
- **Keyword Analysis** – Automatically extracts and visualizes key terms from employee feedback.
- **Data Visualization** – Displays charts for category distribution, keyword frequency, and trends.
- **Fast & Responsive** – Optimized UI for both desktop and mobile.

---

## 🛠 Tech Stack

| Category       | Technology |
|----------------|------------|
| Frontend       | React, TailwindCSS |
| Data Handling  | PapaParse, XLSX |
| Visualization  | Chart.js / Plotly (depending on setup) |
| Build Tool     | Vite or CRA (based on your config) |

---

## 📂 Project Structure

```plaintext
frontend/
│── public/                # Static assets
│── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── utils/             # Helper functions
│   ├── App.jsx            # Main application
│   └── index.jsx          # Entry point
│── package.json           # Dependencies & scripts
│── tailwind.config.js     # TailwindCSS configuration
