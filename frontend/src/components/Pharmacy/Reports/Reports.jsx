// /components/Reports/Reports.jsx
import React from 'react';
import './Reports.css';
import BarChartComponent from './BarChartComponent';

const medicineUsageData = [
  { month: "Jan", usage: 40 },
  { month: "Feb", usage: 60 },
  { month: "Mar", usage: 75 },
  { month: "Apr", usage: 50 },
  { month: "May", usage: 90 },
];

const stockReportData = [
  { name: "Amoxalin", stock: 120 },
  { name: "Penadol", stock: 90 },
  { name: "Antibiotic", stock: 60 },
  { name: "C Vitamin", stock: 30 },
];

const Reports = () => {
  return (
    <div className="reports-container">
      <h1 className="reports-title">Reports & Alerts</h1>
      
      <div className="reports-grid">
        <div className="report-card chart-card">
          <BarChartComponent
            data={medicineUsageData}
            xKey="month"
            barKey="usage"
            title="Monthly Medicine Usage Stats"
          />
        </div>

        <div className="report-card">
          <h2>Frequently Dispense Medicine</h2>
          <table>
            <thead>
              <tr>
                <th><i>Medicine</i></th>
                <th><i>Dispensations</i></th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Amoxalin</td><td>50</td></tr>
              <tr><td>Penadol</td><td>80</td></tr>
              <tr><td>Antibiotic</td><td>100</td></tr>
              <tr><td>c vitamin</td><td>110</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-card">
          <h2>Low Stock History</h2>
          <table>
            <thead>
              <tr>
                <th><i>Medicine</i></th>
                <th><i>Dispensations</i></th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Amoxalin</td><td>50</td></tr>
              <tr><td>Penadol</td><td>80</td></tr>
              <tr><td>Antibiotic</td><td>100</td></tr>
              <tr><td>c vitamin</td><td>110</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-card chart-card">
          <BarChartComponent
            data={stockReportData}
            xKey="name"
            barKey="stock"
            barColor="#82ca9d"
            title="Stock Reports"
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
