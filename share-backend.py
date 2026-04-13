#!/usr/bin/env python3

from flask import Flask, jsonify, request, send_from_directory
import sqlite3
import os
import sys

app = Flask(__name__)

# 数据库初始化
def get_db_connection():
    conn = sqlite3.connect('./database/ipo_audit.db')
    conn.row_factory = sqlite3.Row
    return conn

# 创建数据库表
def init_db():
    conn = get_db_connection()
    
    # IPO案例表
    conn.execute('''
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
    ''')

    # 月度报告表
    conn.execute('''
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
    ''')

    # 周报表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS weekly_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_number INTEGER,
            year_week TEXT NOT NULL,
            applications_count INTEGER,
            keyword_stats TEXT,
            summary_text TEXT,
            created_at TEXT
        )
    ''')
    
    conn.commit()
    
    # 检查是否已有数据，如果没有则插入示例数据
    cursor = conn.execute('SELECT COUNT(*) as count FROM ipo_cases')
    row = cursor.fetchone()
    if row['count'] == 0:
        insert_sample_data(conn)
    
    conn.close()

# 插入示例数据
def insert_sample_data(conn):
    sample_cases = [
        {
            'company_name': '科技创新股份有限公司',
            'stock_code': '300001',
            'industry': '科技',
            'application_date': '2024-01-15',
            'review_status': '已通过',
            'result': '上市成功',
            'rejection_reason': None,
            'audit_time': 120,
            'key_words': '科技创新,人工智能,科创板',
            'detailed_info': '专注于人工智能技术研发，拥有多项核心专利技术。'
        },
        {
            'company_name': '传统制造集团有限公司',
            'stock_code': '600002',
            'industry': '制造业',
            'application_date': '2024-01-20',
            'review_status': '已拒绝',
            'result': '未通过',
            'rejection_reason': '财务数据不透明，盈利能力不足',
            'audit_time': 90,
            'key_words': '传统制造,产能过剩,财务问题',
            'detailed_info': '传统制造业企业，面临转型升级压力。'
        },
        {
            'company_name': '新能源科技发展有限公司',
            'stock_code': '300003',
            'industry': '新能源',
            'application_date': '2024-02-01',
            'review_status': '审核中',
            'result': None,
            'rejection_reason': None,
            'audit_time': 60,
            'key_words': '新能源,清洁能源,碳中和',
            'detailed_info': '专注于新能源技术研发和应用，市场前景良好。'
        }
    ]
    
    for case_data in sample_cases:
        placeholders = ', '.join(['?'] * len(case_data))
        columns = ', '.join(case_data.keys())
        conn.execute(f'INSERT INTO ipo_cases ({columns}) VALUES ({placeholders})', tuple(case_data.values()))
    
    # 添加月度报告数据
    monthly_reports = [
        {
            'year_month': '2024-03',
            'total_applications': 45,
            'approved': 28,
            'rejected': 12,
            'withdrawn': 5,
            'key_trends': '科技行业IPO申请持续增长，审核趋严',
            'analysis_text': '本月IPO审核呈现以下特点：1）科技行业占比达到60%，持续领先；2）审核通过率62%，较上月下降5个百分点；3）拒绝主要集中在财务数据和信息披露问题；4）新能源行业表现突出，申请数量环比增长30%。'
        },
        {
            'year_month': '2024-02',
            'total_applications': 38,
            'approved': 25,
            'rejected': 8,
            'withdrawn': 5,
            'key_trends': '制造业IPO回暖，审核效率提升',
            'analysis_text': '二月IPO市场表现积极：1）制造业IPO申请数量回升至30%；2）平均审核时长缩短至85天；3）通过率达到65.8%，创年内新高；4）生物医药行业表现亮眼，3家企业成功过会。'
        }
    ]
    
    for report in monthly_reports:
        placeholders = ', '.join(['?'] * len(report))
        columns = ', '.join(report.keys())
        conn.execute(f'INSERT INTO monthly_reports ({columns}) VALUES ({placeholders})', tuple(report.values()))
    
    # 添加周报数据
    weekly_reports = [
        {
            'week_number': 11,
            'year_week': '2024-03-11',
            'applications_count': 12,
            'keyword_stats': '{"科技创新": 8, "财务规范": 6, "行业前景": 5, "估值合理": 4, "成长性": 3}',
            'summary_text': '本周IPO申请以科技企业为主，8家企业来自人工智能、云计算等新兴领域。审核重点集中在技术创新能力和商业模式的可持续性。'
        },
        {
            'week_number': 10,
            'year_week': '2024-03-04',
            'applications_count': 15,
            'keyword_stats': '{"新能源": 7, "绿色发展": 6, "政策支持": 5, "技术壁垒": 4, "市场前景": 3}',
            'summary_text': '本周新能源行业IPO申请活跃，占比达到47%。审核关注政策合规性和技术成熟度，3家光伏企业获得重点关注。'
        }
    ]
    
    for report in weekly_reports:
        placeholders = ', '.join(['?'] * len(report))
        columns = ', '.join(report.keys())
        conn.execute(f'INSERT INTO weekly_reports ({columns}) VALUES ({placeholders})', tuple(report.values()))
    
    conn.commit()

# API路由
@app.route('/api/cases', methods=['GET'])
def get_cases():
    search = request.args.get('search', '')
    industry = request.args.get('industry', '')
    status = request.args.get('status', '')
    
    query = 'SELECT * FROM ipo_cases WHERE 1=1'
    params = []
    
    if search:
        query += ' AND (company_name LIKE ? OR key_words LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%'])
    
    if industry:
        query += ' AND industry = ?'
        params.append(industry)
    
    if status:
        query += ' AND review_status = ?'
        params.append(status)
    
    query += ' ORDER BY application_date DESC'
    
    conn = get_db_connection()
    cursor = conn.execute(query, params)
    cases = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(cases)

@app.route('/api/monthly-reports', methods=['GET'])
def get_monthly_reports():
    conn = get_db_connection()
    cursor = conn.execute('SELECT * FROM monthly_reports ORDER BY year_month DESC')
    reports = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(reports)

@app.route('/api/weekly-reports', methods=['GET'])
def get_weekly_reports():
    conn = get_db_connection()
    cursor = conn.execute('SELECT * FROM weekly_reports ORDER BY year_week DESC')
    reports = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(reports)

@app.route('/api/search-cases', methods=['GET'])
def search_cases():
    keyword = request.args.get('keyword', '')
    query = 'SELECT * FROM ipo_cases WHERE company_name LIKE ? OR key_words LIKE ? ORDER BY application_date DESC'
    
    conn = get_db_connection()
    cursor = conn.execute(query, [f'%{keyword}%', f'%{keyword}%'])
    cases = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(cases)

@app.route('/api/cases/<int:case_id>', methods=['GET'])
def get_case(case_id):
    conn = get_db_connection()
    cursor = conn.execute('SELECT * FROM ipo_cases WHERE id = ?', (case_id,))
    case = cursor.fetchone()
    conn.close()
    
    if case:
        return jsonify(dict(case))
    else:
        return jsonify({'error': 'Case not found'}), 404

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': '2026-04-13T03:24:00.000Z'})

if __name__ == '__main__':
    # 确保数据库目录存在
    os.makedirs('./database', exist_ok=True)
    
    # 初始化数据库
    init_db()
    
    # 启动服务器，监听所有接口
    PORT = 3000
    print(f"🚀 IPO审核查询系统后端服务启动成功!")
    print(f"🏠 本地访问: http://localhost:{PORT}")
    print(f"🌍 局域网访问: http://192.168.50.158:{PORT}")
    print(f"🌍 或者: http://ZouXiongdeMac-mini.local:{PORT}")
    print(f"✨ 服务已开启，可在局域网内共享访问")
    print("-" * 50)
    
    app.run(host='0.0.0.0', port=PORT, debug=False)