new Vue({
    el: '#app',
    data: {
        activeTab: 'monthly',
        monthlyReports: [],
        weeklyReports: [],
        cases: [],
        filteredMonthlyReports: [],
        filteredWeeklyReports: [],
        filteredCases: [],
        
        // 搜索和筛选
        monthSearch: '',
        weekSearch: '',
        caseSearch: '',
        selectedIndustry: '',
        selectedStatus: '',
        
        // 图表实例
        charts: {}
    },
    mounted() {
        this.loadAllData();
    },
    methods: {
        // 切换标签页
        handleTabClick() {
            this.$nextTick(() => {
                this.renderCharts();
            });
        },
        
        // 加载所有数据
        loadAllData() {
            this.loadMonthlyReports();
            this.loadWeeklyReports();
            this.loadCases();
        },
        
        // 加载月度报告
        loadMonthlyReports() {
            fetch('/api/monthly-reports')
                .then(response => response.json())
                .then(data => {
                    this.monthlyReports = data;
                    this.filteredMonthlyReports = data;
                })
                .catch(error => {
                    console.error('加载月度报告失败:', error);
                    this.generateSampleMonthlyReports();
                });
        },
        
        // 加载周报
        loadWeeklyReports() {
            fetch('/api/weekly-reports')
                .then(response => response.json())
                .then(data => {
                    this.weeklyReports = data;
                    this.filteredWeeklyReports = data;
                })
                .catch(error => {
                    console.error('加载周报失败:', error);
                    this.generateSampleWeeklyReports();
                });
        },
        
        // 加载案例
        loadCases() {
            fetch('/api/cases')
                .then(response => response.json())
                .then(data => {
                    this.cases = data;
                    this.filteredCases = data;
                })
                .catch(error => {
                    console.error('加载案例失败:', error);
                    this.generateSampleCases();
                });
        },
        
        // 搜索月度报告
        searchMonthlyReports() {
            if (!this.monthSearch) {
                this.filteredMonthlyReports = this.monthlyReports;
            } else {
                this.filteredMonthlyReports = this.monthlyReports.filter(report => 
                    report.year_month.includes(this.monthSearch) ||
                    report.analysis_text.includes(this.monthSearch) ||
                    report.key_trends.includes(this.monthSearch)
                );
            }
        },
        
        // 搜索周报
        searchWeeklyReports() {
            if (!this.weekSearch) {
                this.filteredWeeklyReports = this.weeklyReports;
            } else {
                this.filteredWeeklyReports = this.weeklyReports.filter(report => 
                    report.year_week.includes(this.weekSearch) ||
                    report.summary_text.includes(this.weekSearch)
                );
            }
        },
        
        // 搜索案例
        searchCases() {
            this.filterCases();
        },
        
        // 筛选案例
        filterCases() {
            let filtered = this.cases;
            
            if (this.caseSearch) {
                const searchTerm = this.caseSearch.toLowerCase();
                filtered = filtered.filter(caseItem => 
                    caseItem.company_name.toLowerCase().includes(searchTerm) ||
                    case.key_words.toLowerCase().includes(searchTerm) ||
                    case.detailed_info.toLowerCase().includes(searchTerm)
                );
            }
            
            if (this.selectedIndustry) {
                filtered = filtered.filter(caseItem => 
                    caseItem.industry === this.selectedIndustry
                );
            }
            
            if (this.selectedStatus) {
                filtered = filtered.filter(caseItem => 
                    caseItem.review_status === this.selectedStatus
                );
            }
            
            this.filteredCases = filtered;
        },
        
        // 获取状态样式
        getStatusClass(status) {
            switch(status) {
                case '已通过': return 'status-approved';
                case '已拒绝': return 'status-rejected';
                case '审核中': return 'status-reviewing';
                default: return '';
            }
        },
        
        // 渲染图表
        renderCharts() {
            // 渲染月度报告图表
            this.filteredMonthlyReports.forEach(report => {
                const chartId = `monthlyChart${report.id}`;
                const chartElement = document.getElementById(chartId);
                if (chartElement) {
                    const chart = echarts.init(chartElement);
                    const option = {
                        title: {
                            text: `${report.year_month} IPO审核统计`,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        xAxis: {
                            type: 'category',
                            data: ['申请', '通过', '拒绝', '撤回']
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series: [{
                            data: [
                                report.total_applications,
                                report.approved,
                                report.rejected,
                                report.withdrawn
                            ],
                            type: 'bar',
                            itemStyle: {
                                color: function(params) {
                                    const colors = ['#409eff', '#67c23a', '#f56c6c', '#e6a23c'];
                                    return colors[params.dataIndex];
                                }
                            }
                        }]
                    };
                    chart.setOption(option);
                    this.charts[chartId] = chart;
                }
            });
            
            // 渲染周报图表
            this.filteredWeeklyReports.forEach(report => {
                const chartId = `weeklyChart${report.id}`;
                const chartElement = document.getElementById(chartId);
                if (chartElement) {
                    const chart = echarts.init(chartElement);
                    try {
                        const keywords = JSON.parse(report.keyword_stats || '{}');
                        const keywordNames = keywords.map(k => k.name);
                        const keywordCounts = keywords.map(k => k.count);
                        
                        const option = {
                            title: {
                                text: `${report.year_week} 关键词统计`,
                                left: 'center'
                            },
                            tooltip: {
                                trigger: 'item'
                            },
                            series: [{
                                type: 'pie',
                                radius: '50%',
                                data: keywords.map(k => ({
                                    name: k.name,
                                    value: k.count
                                }))
                            }]
                        };
                        chart.setOption(option);
                    } catch (e) {
                        // 如果解析失败，显示简单图表
                        const option = {
                            title: {
                                text: `${report.year_week} 申请数量`,
                                left: 'center'
                            },
                            xAxis: {
                                type: 'category',
                                data: ['IPO申请']
                            },
                            yAxis: {
                                type: 'value'
                            },
                            series: [{
                                data: [report.applications_count],
                                type: 'bar'
                            }]
                        };
                        chart.setOption(option);
                    }
                    this.charts[chartId] = chart;
                }
            });
        },
        
        // 生成示例月度报告数据
        generateSampleMonthlyReports() {
            const sampleReports = [
                {
                    id: 1,
                    year_month: '2024-03',
                    total_applications: 45,
                    approved: 28,
                    rejected: 12,
                    withdrawn: 5,
                    key_trends: '科技行业IPO申请持续增长，审核趋严',
                    analysis_text: '本月IPO审核呈现以下特点：1）科技行业占比达到60%，持续领先；2）审核通过率62%，较上月下降5个百分点；3）拒绝主要集中在财务数据和信息披露问题；4）新能源行业表现突出，申请数量环比增长30%。'
                },
                {
                    id: 2,
                    year_month: '2024-02',
                    total_applications: 38,
                    approved: 25,
                    rejected: 8,
                    withdrawn: 5,
                    key_trends: '制造业IPO回暖，审核效率提升',
                    analysis_text: '二月IPO市场表现积极：1）制造业IPO申请数量回升至30%；2）平均审核时长缩短至85天；3）通过率达到65.8%，创年内新高；4）生物医药行业表现亮眼，3家企业成功过会。'
                }
            ];
            
            this.monthlyReports = sampleReports;
            this.filteredMonthlyReports = sampleReports;
        },
        
        // 生成示例周报数据
        generateSampleWeeklyReports() {
            const sampleReports = [
                {
                    id: 1,
                    week_number: 11,
                    year_week: '2024-03-11',
                    applications_count: 12,
                    keyword_stats: JSON.stringify([
                        { name: '科技创新', count: 8 },
                        { name: '财务规范', count: 6 },
                        { name: '行业前景', count: 5 },
                        { name: '估值合理', count: 4 },
                        { name: '成长性', count: 3 }
                    ]),
                    summary_text: '本周IPO申请以科技企业为主，8家企业来自人工智能、云计算等新兴领域。审核重点集中在技术创新能力和商业模式的可持续性。'
                },
                {
                    id: 2,
                    week_number: 10,
                    year_week: '2024-03-04',
                    applications_count: 15,
                    keyword_stats: JSON.stringify([
                        { name: '新能源', count: 7 },
                        { name: '绿色发展', count: 6 },
                        { name: '政策支持', count: 5 },
                        { name: '技术壁垒', count: 4 },
                        { name: '市场前景', count: 3 }
                    ]),
                    summary_text: '本周新能源行业IPO申请活跃，占比达到47%。审核关注政策合规性和技术成熟度，3家光伏企业获得重点关注。'
                }
            ];
            
            this.weeklyReports = sampleReports;
            this.filteredWeeklyReports = sampleReports;
        },
        
        // 生成示例案例数据
        generateSampleCases() {
            const sampleCases = [
                {
                    id: 1,
                    company_name: '科技创新股份有限公司',
                    stock_code: '300001',
                    industry: '科技',
                    application_date: '2024-01-15',
                    review_status: '已通过',
                    result: '上市成功',
                    rejection_reason: null,
                    audit_time: 120,
                    key_words: '科技创新,人工智能,科创板',
                    detailed_info: '专注于人工智能技术研发，拥有多项核心专利技术。公司营收连续三年保持50%以上增长，毛利率超过70%。审核过程中重点关注技术壁垒和商业模式的可持续性。'
                },
                {
                    id: 2,
                    company_name: '传统制造集团有限公司',
                    stock_code: '600002',
                    industry: '制造业',
                    application_date: '2024-01-20',
                    review_status: '已拒绝',
                    result: '未通过',
                    rejection_reason: '财务数据不透明，盈利能力不足',
                    audit_time: 90,
                    key_words: '传统制造,产能过剩,财务问题',
                    detailed_info: '传统制造业企业，面临转型升级压力。公司营收增长缓慢，毛利率低于行业平均水平，应收账款周转率较差。'
                },
                {
                    id: 3,
                    company_name: '新能源科技发展有限公司',
                    stock_code: '300003',
                    industry: '新能源',
                    application_date: '2024-02-01',
                    review_status: '审核中',
                    result: null,
                    rejection_reason: null,
                    audit_time: 60,
                    key_words: '新能源,清洁能源,碳中和',
                    detailed_info: '专注于新能源技术研发和应用，市场前景良好。公司拥有自主研发技术，在光伏领域处于行业领先地位。目前正在等待证监会审核反馈。'
                }
            ];
            
            this.cases = sampleCases;
            this.filteredCases = sampleCases;
        }
    }
});