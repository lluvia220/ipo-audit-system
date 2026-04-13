const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库初始化
const db = new sqlite3.Database('./database/ipo_audit.db');

// 创建数据库表
db.serialize(() => {
    // IPO案例表
    db.run(`
        CREATE TABLE IF NOT EXISTS ipo_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL,
            stock_code TEXT,
            industry TEXT,
            application_date TEXT,
            review_status TEXT,
            result TEXT,
            rejection_reason TEXT,
            audit_time INTEGER,
            key_words TEXT,
            detailed_info TEXT
        )
    `);

    // 月度报告表
    db.run(`
        CREATE TABLE IF NOT EXISTS monthly_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year_month TEXT NOT NULL,
            total_applications INTEGER,
            approved INTEGER,
            rejected INTEGER,
            withdrawn INTEGER,
            key_trends TEXT,
            analysis_text TEXT,
            created_at TEXT
        )
    `);

    // 周报表
    db.run(`
        CREATE TABLE IF NOT EXISTS weekly_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_number INTEGER,
            year_week TEXT NOT NULL,
            applications_count INTEGER,
            keyword_stats TEXT,
            summary_text TEXT,
            created_at TEXT
        )
    `);

    // 插入一些示例数据
    insertSampleData();
});

// API路由
// 获取所有IPO案例
app.get('/api/cases', (req, res) => {
    const { search, industry, status } = req.query;
    let query = 'SELECT * FROM ipo_cases WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (company_name LIKE ? OR key_words LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    if (industry) {
        query += ' AND industry = ?';
        params.push(industry);
    }

    if (status) {
        query += ' AND review_status = ?';
        params.push(status);
    }

    query += ' ORDER BY application_date DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 获取月度报告
app.get('/api/monthly-reports', (req, res) => {
    db.all('SELECT * FROM monthly_reports ORDER BY year_month DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 获取周报
app.get('/api/weekly-reports', (req, res) => {
    db.all('SELECT * FROM weekly_reports ORDER BY year_week DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 搜索案例
app.get('/api/search-cases', (req, res) => {
    const { keyword } = req.query;
    const query = 'SELECT * FROM ipo_cases WHERE company_name LIKE ? OR key_words LIKE ? ORDER BY application_date DESC';
    
    db.all(query, [`%${keyword}%`, `%${keyword}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 获取案例详情
app.get('/api/cases/:id', (req, res) => {
    const query = 'SELECT * FROM ipo_cases WHERE id = ?';
    
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Case not found' });
        } else {
            res.json(row);
        }
    });
});

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, '../frontend/dist')));

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`IPO审核查询系统后端服务运行在端口 ${PORT}`);
});

// 插入示例数据函数
function insertSampleData() {
    // 检查是否已有数据
    db.get('SELECT COUNT(*) as count FROM ipo_cases', (err, row) => {
        if (err) return;
        if (row.count === 0) {
            // 插入示例IPO案例
            const sampleCases = [
                {
                    company_name: '科技创新股份有限公司',
                    stock_code: '300001',
                    industry: '科技',
                    application_date: '2024-01-15',
                    review_status: '已通过',
                    result: '上市成功',
                    rejection_reason: null,
                    audit_time: 120,
                    key_words: '科技创新,人工智能,科创板',
                    detailed_info: '专注于人工智能技术研发，拥有多项核心专利技术。'
                },
                {
                    company_name: '传统制造集团有限公司',
                    stock_code: '600002',
                    industry: '制造业',
                    application_date: '2024-01-20',
                    review_status: '已拒绝',
                    result: '未通过',
                    rejection_reason: '财务数据不透明，盈利能力不足',
                    audit_time: 90,
                    key_words: '传统制造,产能过剩,财务问题',
                    detailed_info: '传统制造业企业，面临转型升级压力。'
                },
                {
                    company_name: '新能源科技发展有限公司',
                    stock_code: '300003',
                    industry: '新能源',
                    application_date: '2024-02-01',
                    review_status: '审核中',
                    result: null,
                    rejection_reason: null,
                    audit_time: 60,
                    key_words: '新能源,清洁能源,碳中和',
                    detailed_info: '专注于新能源技术研发和应用，市场前景良好。'
                }
            ];

            const stmt = db.prepare('INSERT INTO ipo_cases (company_name, stock_code, industry, application_date, review_status, result, rejection_reason, audit_time, key_words, detailed_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            
            sampleCases.forEach(caseData => {
                stmt.run(
                    caseData.company_name,
                    caseData.stock_code,
                    caseData.industry,
                    caseData.application_date,
                    caseData.review_status,
                    caseData.result,
                    caseData.rejection_reason,
                    caseData.audit_time,
                    caseData.key_words,
                    caseData.detailed_info
                );
            });
            
            stmt.finalize();
        }
    });
}