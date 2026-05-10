---
permalink: /exam_notes/
title: "可信考试知识点"
excerpt: "C++ STL速记与编程考题模板"
author_profile: false
---

{% raw %}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>可信考试知识点</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 960px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 { text-align: center; border-bottom: 3px solid #4CAF50; padding-bottom: 15px; }
        h2 {
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            color: #fff;
            padding: 10px 18px;
            border-radius: 6px;
            margin-top: 40px;
        }
        h3 {
            border-left: 4px solid #4CAF50;
            padding-left: 12px;
            color: #2E7D32;
            margin-top: 28px;
        }
        h4 {
            color: #555;
            margin-top: 18px;
            font-size: 1.05em;
        }
        pre {
            padding: 16px 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 15px;
            line-height: 1.6;
        }
        code {
            font-family: "Fira Code", "Cascadia Code", Consolas, monospace;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.95em;
        }
        pre code {
            background: none;
            padding: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 0.95em;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background: #4CAF50;
            color: #fff;
            font-weight: 600;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        .note {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px 16px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .tip {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 10px 16px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .warn {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 10px 16px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .back-link {
            display: inline-block;
            color: #fff;
            background: #6c757d;
            text-decoration: none;
            padding: 8px 18px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .back-link:hover { background: #5a6268; }
        .tag {
            display: inline-block;
            background: #e8f5e9;
            color: #2E7D32;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.85em;
            margin: 2px 4px;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css">
</head>
<body>

<a href="/" class="back-link">&larr; 返回首页</a>

<h1>C++ STL 速记 &amp; 编程考题模板</h1>

<!-- ============================================================ -->
<!-- PART 1: C++ STL -->
<!-- ============================================================ -->

<h2>一、C++ STL 核心容器速记</h2>

<!-- ---------- vector ---------- -->
<h3>1. vector&lt;T&gt; — 动态数组</h3>

<table>
<tr><th>操作</th><th>代码</th><th>说明</th></tr>
<tr><td>初始化</td><td><code>vector&lt;int&gt; v; vector&lt;int&gt; v(n, 0); vector&lt;int&gt; v{1,2,3};</code></td><td>空 / n个0 / 列表初始化</td></tr>
<tr><td>尾部增删</td><td><code>v.push_back(x); v.pop_back();</code></td><td>O(1) 均摊</td></tr>
<tr><td>随机访问</td><td><code>v[i]; v.at(i); v.front(); v.back();</code></td><td>at() 会抛异常</td></tr>
<tr><td>大小</td><td><code>v.size(); v.empty(); v.capacity();</code></td><td></td></tr>
<tr><td>插入删除</td><td><code>v.insert(pos, x); v.erase(pos); v.erase(l, r);</code></td><td>O(n)</td></tr>
<tr><td>清空</td><td><code>v.clear();</code></td><td></td></tr>
<tr><td>排序</td><td><code>sort(v.begin(), v.end()); sort(v.rbegin(), v.rend());</code></td><td>升序 / 降序</td></tr>
<tr><td>二分查找</td><td><code>auto it = lower_bound(v.begin(), v.end(), x);</code></td><td>需有序，返回 &ge;x 的首个位置</td></tr>
</table>

<pre><code>// vector 遍历
for (int x : v) { /* ... */ }
for (int i = 0; i &lt; v.size(); ++i) { v[i]; }
for (auto it = v.begin(); it != v.end(); ++it) { *it; }

// 自定义排序
sort(v.begin(), v.end(), [](int a, int b) { return a &gt; b; });

// 去重（需先排序）
sort(v.begin(), v.end());
v.erase(unique(v.begin(), v.end()), v.end());
</code></pre>

<!-- ---------- string ---------- -->
<h3>2. string — 字符串</h3>

<table>
<tr><th>操作</th><th>代码</th><th>说明</th></tr>
<tr><td>子串</td><td><code>s.substr(pos, len);</code></td><td>O(len)，不写len取到末尾</td></tr>
<tr><td>查找</td><td><code>s.find(t); s.rfind(t); s.find_first_of(t);</code></td><td>返回下标或 string::npos</td></tr>
<tr><td>替换</td><td><code>s.replace(pos, len, t);</code></td><td></td></tr>
<tr><td>插入/删除</td><td><code>s.insert(pos, t); s.erase(pos, len);</code></td><td></td></tr>
<tr><td>数值转换</td><td><code>stoi(s); stoll(s); stod(s); to_string(x);</code></td><td>string↔数值</td></tr>
<tr><td>C串</td><td><code>s.c_str();</code></td><td>返回 const char*</td></tr>
<tr><td>连接</td><td><code>s += t; s.append(t);</code></td><td>+ 也可，+= 更高效</td></tr>
<tr><td>比较</td><td><code>s == t; s.compare(t);</code></td><td>按字典序</td></tr>
</table>

<pre><code>// 常用：按分隔符拆分字符串
vector&lt;string&gt; split(const string&amp; s, char delim) {
    vector&lt;string&gt; res;
    stringstream ss(s);
    string token;
    while (getline(ss, token, delim)) res.push_back(token);
    return res;
}

// 常用：翻转字符串
reverse(s.begin(), s.end());

// 常用：判断字符类型
isalpha(c); isdigit(c); isalnum(c); isspace(c);
toupper(c); tolower(c);

// string → int（十六进制）
int x = stoi("1A", nullptr, 16);  // x = 26
</code></pre>

<!-- ---------- map ---------- -->
<h3>3. map&lt;K,V&gt; — 有序映射（红黑树）</h3>

<table>
<tr><th>操作</th><th>代码</th><th>说明</th></tr>
<tr><td>插入/更新</td><td><code>m[k] = v; m.insert({k,v}); m.emplace(k,v);</code></td><td>[] 不存在则插入默认值</td></tr>
<tr><td>删除</td><td><code>m.erase(k); m.erase(it);</code></td><td></td></tr>
<tr><td>查找</td><td><code>auto it = m.find(k);</code> 或 <code>m.count(k);</code></td><td>find返回迭代器，不存在返回end()</td></tr>
<tr><td>二分</td><td><code>m.lower_bound(k); m.upper_bound(k);</code></td><td>仅 map 支持</td></tr>
<tr><td>遍历</td><td><code>for (auto& [k,v] : m) { }</code></td><td>按键升序遍历</td></tr>
</table>

<div class="warn"><strong>陷阱：</strong><code>m[k]</code> 若 k 不存在会自动插入默认值。仅判断存在用 <code>m.find(k) != m.end()</code> 或 <code>m.count(k)</code>。</div>

<pre><code>// 自定义键排序（降序）
map&lt;int, string, greater&lt;int&gt;&gt; m;

// 按 value 排序 → 转 vector
vector&lt;pair&lt;int,string&gt;&gt; v(m.begin(), m.end());
sort(v.begin(), v.end(), [](auto&amp; a, auto&amp; b) {
    return a.second &lt; b.second;
});
</code></pre>

<!-- ---------- unordered_map ---------- -->
<h3>4. unordered_map&lt;K,V&gt; — 哈希映射</h3>

<table>
<tr><th>操作</th><th>代码</th><th>说明</th></tr>
<tr><td>基本操作</td><td>同 map：<code>[] insert erase find count</code></td><td>均摊 O(1)</td></tr>
<tr><td>不支持</td><td><code>lower_bound / upper_bound</code></td><td>哈希表无序</td></tr>
<tr><td>遍历</td><td><code>for (auto& [k,v] : um) { }</code></td><td>无序</td></tr>
</table>

<div class="tip"><strong>选择：</strong>不需要有序时优先用 unordered_map，O(1) vs O(log n)。需要按序遍历或二分时用 map。</div>

<pre><code>// 统计频率
unordered_map&lt;string, int&gt; freq;
for (auto&amp; w : words) freq[w]++;

// 自定义哈希（pair为例）
struct pair_hash {
    template&lt;class T1, class T2&gt;
    size_t operator()(const pair&lt;T1,T2&gt;&amp; p) const {
        return hash&lt;T1&gt;{}(p.first) ^ (hash&lt;T2&gt;{}(p.second) &lt;&lt; 1);
    }
};
unordered_map&lt;pair&lt;int,int&gt;, int, pair_hash&gt; um;
</code></pre>

<!-- ---------- priority_queue ---------- -->
<h3>5. priority_queue&lt;T&gt; — 优先队列（堆）</h3>

<table>
<tr><th>操作</th><th>代码</th><th>说明</th></tr>
<tr><td>压入</td><td><code>pq.push(x);</code></td><td>O(log n)</td></tr>
<tr><td>弹出</td><td><code>pq.pop();</code></td><td>O(log n)，无返回值</td></tr>
<tr><td>堆顶</td><td><code>pq.top();</code></td><td>O(1)</td></tr>
<tr><td>大小</td><td><code>pq.size(); pq.empty();</code></td><td></td></tr>
</table>

<pre><code>// 默认：最大堆（大顶堆）
priority_queue&lt;int&gt; pq;           // top() 返回最大值
priority_queue&lt;int, vector&lt;int&gt;, less&lt;int&gt;&gt; pq;  // 等价

// 最小堆
priority_queue&lt;int, vector&lt;int&gt;, greater&lt;int&gt;&gt; min_pq;

// 自定义比较器（用 decltype + lambda，C++20前需传lambda给构造函数）
auto cmp = [](int a, int b) { return a &gt; b; };
priority_queue&lt;int, vector&lt;int&gt;, decltype(cmp)&gt; pq(cmp);

// 存储 pair，按 second 排序（最小堆）
using P = pair&lt;string, int&gt;;
auto cmp = [](P&amp; a, P&amp; b) { return a.second &gt; b.second; };
priority_queue&lt;P, vector&lt;P&gt;, decltype(cmp)&gt; pq(cmp);

// 手写结构体比较器
struct Node { int val, idx; };
struct Cmp {
    bool operator()(Node&amp; a, Node&amp; b) { return a.val &lt; b.val; } // 大顶堆
};
priority_queue&lt;Node, vector&lt;Node&gt;, Cmp&gt; pq;
</code></pre>

<div class="note"><strong>记忆口诀：</strong>默认 less → 大顶堆（大的在顶）。greater → 小顶堆（小的在顶）。自定义 cmp 返回 true 表示"a 优先级低于 b"。</div>

<!-- ---------- 其他常用 STL ---------- -->
<h3>6. 其他常用 STL 速查</h3>

<pre><code>// set / unordered_set — 集合
set&lt;int&gt; s;                    // 有序，O(log n)
unordered_set&lt;int&gt; us;        // 哈希，O(1)
s.insert(x); s.erase(x);
s.count(x);                   // 是否存在
s.lower_bound(x);             // 仅 set

// stack — 栈
stack&lt;int&gt; st;
st.push(x); st.pop(); st.top(); st.empty();

// queue — 队列
queue&lt;int&gt; q;
q.push(x); q.pop(); q.front(); q.back(); q.empty();

// deque — 双端队列
deque&lt;int&gt; dq;
dq.push_back(x); dq.push_front(x);
dq.pop_back(); dq.pop_front();
dq.front(); dq.back();

// pair
pair&lt;int,string&gt; p{1, "hello"};
p.first; p.second;
auto [a, b] = p;              // 结构化绑定 (C++17)

// algorithm 常用
sort(b, e);                   // 排序
sort(b, e, cmp);              // 自定义排序
reverse(b, e);                // 翻转
max_element(b, e);            // 返回最大元素迭代器
min_element(b, e);
accumulate(b, e, 0);          // 求和 &lt;numeric&gt;
next_permutation(b, e);       // 全排列
binary_search(b, e, x);       // 二分判断存在
lower_bound(b, e, x);         // 首个 ≥x
upper_bound(b, e, x);         // 首个 >x
nth_element(b, nth, e);       // 第n小的放到正确位置</code></pre>

<!-- ============================================================ -->
<!-- PART 2: 编程考题模板 -->
<!-- ============================================================ -->

<h2>二、编程考题模板</h2>

<!-- ---------- 2.1 进制转换 ---------- -->
<h3>2.1 十六进制 / 数值双向转换</h3>

<pre><code>// ====== 数值 → 十六进制字符串 ======
// 方法1：stringstream
#include &lt;sstream&gt;
#include &lt;iomanip&gt;
string to_hex(int num) {
    stringstream ss;
    ss &lt;&lt; hex &lt;&lt; num;
    return ss.str();                      // 255 → "ff"
}
string to_hex_upper(int num) {
    stringstream ss;
    ss &lt;&lt; hex &lt;&lt; uppercase &lt;&lt; num;
    return ss.str();                      // 255 → "FF"
}

// 方法2：snprintf
char buf[32];
snprintf(buf, sizeof(buf), "%x", num);    // "ff"
snprintf(buf, sizeof(buf), "%X", num);    // "FF"
snprintf(buf, sizeof(buf), "%08x", num);  // 定宽补零 "000000ff"

// 方法3：C++17 to_chars (高性能)
char buf[32];
to_chars(buf, buf + 32, num, 16);

// ====== 十六进制字符串 → 数值 ======
// 方法1：stoi / stoll
int x = stoi("ff", nullptr, 16);          // 255
int x = stoi("1A", nullptr, 16);          // 26
long long y = stoll("7FFFFFFF", nullptr, 16);

// 方法2：stringstream
stringstream ss("1A");
int x; ss &gt;&gt; hex &gt;&gt; x;                    // 26

// 方法3：strtol
long x = strtol("ff", nullptr, 16);        // 255

// ====== 任意进制转换 ======
// 数值 → K进制字符串
string to_base(int num, int base) {
    if (num == 0) return "0";
    string s;
    const string digits = "0123456789ABCDEF";
    while (num &gt; 0) {
        s = digits[num % base] + s;
        num /= base;
    }
    return s;
}

// K进制字符串 → 数值
int from_base(const string&amp; s, int base) {
    int num = 0;
    for (char c : s) {
        num = num * base + (isdigit(c) ? c-'0' : toupper(c)-'A'+10);
    }
    return num;
}
</code></pre>

<!-- ---------- 2.2 滑动窗口 ---------- -->
<h3>2.2 滑动窗口 / 时间窗口阈值检测</h3>

<pre><code>// ====== 基础：定长滑动窗口 ======
// 求长度为k的窗口最大和
int max_window_sum(vector&lt;int&gt;&amp; nums, int k) {
    int sum = 0, ans = 0;
    for (int i = 0; i &lt; nums.size(); ++i) {
        sum += nums[i];
        if (i &gt;= k) sum -= nums[i - k];
        if (i &gt;= k - 1) ans = max(ans, sum);
    }
    return ans;
}

// ====== 不定长滑动窗口（双指针） ======
// 最长无重复子串
int length_of_longest_substring(string s) {
    int ans = 0, l = 0;
    unordered_map&lt;char, int&gt; pos;
    for (int r = 0; r &lt; s.size(); ++r) {
        if (pos.count(s[r])) l = max(l, pos[s[r]] + 1);
        pos[s[r]] = r;
        ans = max(ans, r - l + 1);
    }
    return ans;
}

// 和 ≥ target 的最短子数组长度
int min_subarray_len(int target, vector&lt;int&gt;&amp; nums) {
    int ans = INT_MAX, sum = 0, l = 0;
    for (int r = 0; r &lt; nums.size(); ++r) {
        sum += nums[r];
        while (sum &gt;= target) {
            ans = min(ans, r - l + 1);
            sum -= nums[l++];
        }
    }
    return ans == INT_MAX ? 0 : ans;
}

// ====== 时间窗口阈值检测 ======
// 给定时间戳数组和窗口大小w，检测窗口内事件数是否≥阈值
bool check_threshold(vector&lt;int&gt;&amp; timestamps, int window_ms, int threshold) {
    int l = 0;
    for (int r = 0; r &lt; timestamps.size(); ++r) {
        while (timestamps[r] - timestamps[l] &gt; window_ms) l++;
        if (r - l + 1 &gt;= threshold) return true;  // 触发
    }
    return false;
}

// 日志限流：每秒最多允许maxReq条
bool ratelimit(vector&lt;int&gt;&amp; requests, int max_req_per_sec) {
    deque&lt;int&gt; window;
    for (int t : requests) {
        while (!window.empty() &amp;&amp; t - window.front() &gt;= 1000)
            window.pop_front();
        window.push_back(t);
        if (window.size() &gt; max_req_per_sec) return false;
    }
    return true;
}
</code></pre>

<!-- ---------- 2.3 Top K ---------- -->
<h3>2.3 Top K 高频词统计</h3>

<pre><code>// ====== 方法1：unordered_map + 最小堆（O(n log k)） ======
vector&lt;string&gt; top_k_frequent(vector&lt;string&gt;&amp; words, int k) {
    unordered_map&lt;string, int&gt; freq;
    for (auto&amp; w : words) freq[w]++;

    auto cmp = [](auto&amp; a, auto&amp; b) {
        // 频次低的优先（小顶堆），频次相同则字典序大的优先
        return a.second &gt; b.second ||
               (a.second == b.second &amp;&amp; a.first &lt; b.first);
    };
    priority_queue&lt;pair&lt;string,int&gt;, vector&lt;pair&lt;string,int&gt;&gt;, decltype(cmp)&gt; pq(cmp);

    for (auto&amp; [w, c] : freq) {
        pq.push({w, c});
        if (pq.size() &gt; k) pq.pop();
    }

    vector&lt;string&gt; ans;
    while (!pq.empty()) {
        ans.push_back(pq.top().first);
        pq.pop();
    }
    reverse(ans.begin(), ans.end());  // 从高到低
    return ans;
}

// ====== 方法2：nth_element（O(n)，无需完全排序） ======
vector&lt;string&gt; top_k_by_nth(vector&lt;string&gt;&amp; words, int k) {
    unordered_map&lt;string, int&gt; freq;
    for (auto&amp; w : words) freq[w]++;

    vector&lt;pair&lt;string,int&gt;&gt; entry(freq.begin(), freq.end());
    if (k &lt; entry.size())
        nth_element(entry.begin(), entry.begin()+k, entry.end(),
            [](auto&amp; a, auto&amp; b) { return a.second &gt; b.second; });
    sort(entry.begin(), entry.begin()+k,
        [](auto&amp; a, auto&amp; b) { return a.second &gt; b.second; });

    vector&lt;string&gt; ans;
    for (int i = 0; i &lt; k &amp;&amp; i &lt; entry.size(); ++i)
        ans.push_back(entry[i].first);
    return ans;
}

// ====== 大数据量：桶排序（频次为下标） ======
vector&lt;string&gt; top_k_bucket(vector&lt;string&gt;&amp; words, int k) {
    unordered_map&lt;string, int&gt; freq;
    for (auto&amp; w : words) freq[w]++;

    int n = words.size();
    vector&lt;vector&lt;string&gt;&gt; buckets(n + 1);
    for (auto&amp; [w, c] : freq) buckets[c].push_back(w);

    vector&lt;string&gt; ans;
    for (int i = n; i &gt; 0 &amp;&amp; ans.size() &lt; k; --i)
        for (auto&amp; w : buckets[i])
            if (ans.size() &lt; k) ans.push_back(w);
    return ans;
}
</code></pre>

<!-- ---------- 2.4 字符串操作 ---------- -->
<h3>2.4 字符串去重、合并与拆分</h3>

<pre><code>// ====== 字符串按分隔符拆分 ======
vector&lt;string&gt; split(const string&amp; s, char delim) {
    vector&lt;string&gt; res;
    stringstream ss(s);
    string token;
    while (getline(ss, token, delim)) res.push_back(token);
    return res;
}

vector&lt;string&gt; split(const string&amp; s, const string&amp; delim) {
    vector&lt;string&gt; res;
    size_t l = 0, r;
    while ((r = s.find(delim, l)) != string::npos) {
        if (r &gt; l) res.push_back(s.substr(l, r - l));
        l = r + delim.length();
    }
    if (l &lt; s.size()) res.push_back(s.substr(l));
    return res;
}

// ====== 字符串合并 ======
string join(vector&lt;string&gt;&amp; parts, const string&amp; delim) {
    if (parts.empty()) return "";
    string res = parts[0];
    for (int i = 1; i &lt; parts.size(); ++i)
        res += delim + parts[i];
    return res;
}

// ====== 字符串去重（保留首次出现） ======
string dedup_chars(const string&amp; s) {
    bool seen[256] = {};
    string res;
    for (char c : s)
        if (!seen[(unsigned char)c]) {
            seen[(unsigned char)c] = true;
            res += c;
        }
    return res;
}

// 数组中去重（字符串）
vector&lt;string&gt; dedup(vector&lt;string&gt;&amp; v) {
    unordered_set&lt;string&gt; seen;
    vector&lt;string&gt; res;
    for (auto&amp; s : v)
        if (seen.insert(s).second) res.push_back(s);
    return res;
}

// ====== 去除首尾空格 ======
string trim(const string&amp; s) {
    auto l = s.find_first_not_of(" \t\n\r");
    if (l == string::npos) return "";
    auto r = s.find_last_not_of(" \t\n\r");
    return s.substr(l, r - l + 1);
}

// ====== 统计字符频次 ======
int cnt[26] = {};
for (char c : s) cnt[c - 'a']++;

// ====== 判断回文 ======
bool is_palindrome(const string&amp; s) {
    int l = 0, r = s.size() - 1;
    while (l &lt; r) if (s[l++] != s[r--]) return false;
    return true;
}
</code></pre>

<!-- ---------- 2.5 区间 ---------- -->
<h3>2.5 区间重叠判断</h3>

<pre><code>// ====== 判断两个区间是否重叠 ======
// 区间 [a,b] 和 [c,d] 重叠 ⟺ a≤d && c≤b
bool is_overlap(int a, int b, int c, int d) {
    return a &lt;= d &amp;&amp; c &lt;= b;
}

// ====== 合并所有重叠区间 ======
vector&lt;pair&lt;int,int&gt;&gt; merge_intervals(vector&lt;pair&lt;int,int&gt;&gt;&amp; intervals) {
    if (intervals.empty()) return {};
    sort(intervals.begin(), intervals.end());  // 按start排序
    vector&lt;pair&lt;int,int&gt;&gt; res;
    auto [cur_l, cur_r] = intervals[0];
    for (int i = 1; i &lt; intervals.size(); ++i) {
        auto [l, r] = intervals[i];
        if (l &lt;= cur_r)  // 重叠
            cur_r = max(cur_r, r);
        else {
            res.emplace_back(cur_l, cur_r);
            cur_l = l; cur_r = r;
        }
    }
    res.emplace_back(cur_l, cur_r);
    return res;
}

// ====== 插入新区间后合并 ======
vector&lt;pair&lt;int,int&gt;&gt; insert_and_merge(
    vector&lt;pair&lt;int,int&gt;&gt; intervals, pair&lt;int,int&gt; new_iv) {
    vector&lt;pair&lt;int,int&gt;&gt; res;
    int i = 0, n = intervals.size();
    // 左侧不重叠
    while (i &lt; n &amp;&amp; intervals[i].second &lt; new_iv.first)
        res.push_back(intervals[i++]);
    // 重叠区合并
    while (i &lt; n &amp;&amp; intervals[i].first &lt;= new_iv.second) {
        new_iv.first  = min(new_iv.first,  intervals[i].first);
        new_iv.second = max(new_iv.second, intervals[i].second);
        i++;
    }
    res.push_back(new_iv);
    // 右侧不重叠
    while (i &lt; n) res.push_back(intervals[i++]);
    return res;
}

// ====== 判断区间集合是否有重叠 ======
bool has_overlap(vector&lt;pair&lt;int,int&gt;&gt;&amp; intervals) {
    if (intervals.size() &lt;= 1) return false;
    sort(intervals.begin(), intervals.end());
    for (int i = 1; i &lt; intervals.size(); ++i)
        if (intervals[i].first &lt;= intervals[i-1].second)
            return true;
    return false;
}

// ====== 求最多重叠数（扫描线） ======
int max_overlap_count(vector&lt;pair&lt;int,int&gt;&gt;&amp; intervals) {
    vector&lt;pair&lt;int,int&gt;&gt; events;  // {time, delta}
    for (auto&amp; [l, r] : intervals) {
        events.emplace_back(l,  1);  // 开始
        events.emplace_back(r, -1);  // 结束（若端点不重叠则 r+1）
    }
    sort(events.begin(), events.end());
    int cur = 0, ans = 0;
    for (auto&amp; [t, d] : events) {
        cur += d;
        ans = max(ans, cur);
    }
    return ans;
}
</code></pre>

<!-- ---------- 2.6 二分查找 ---------- -->
<h3>2.6 二分查找模板</h3>

<pre><code>// ====== 标准二分：查找 target ======
int binary_search(vector&lt;int&gt;&amp; nums, int target) {
    int l = 0, r = nums.size() - 1;
    while (l &lt;= r) {
        int mid = l + (r - l) / 2;  // 防溢出
        if (nums[mid] == target) return mid;
        else if (nums[mid] &lt; target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

// ====== 第一个 ≥ target（lower_bound） ======
int first_ge(vector&lt;int&gt;&amp; nums, int target) {
    int l = 0, r = nums.size();
    while (l &lt; r) {
        int mid = l + (r - l) / 2;
        if (nums[mid] &gt;= target) r = mid;
        else l = mid + 1;
    }
    return l;  // l == nums.size() 表示不存在
}

// ====== 最后一个 ≤ target ======
int last_le(vector&lt;int&gt;&amp; nums, int target) {
    int l = 0, r = nums.size() - 1, ans = -1;
    while (l &lt;= r) {
        int mid = l + (r - l) / 2;
        if (nums[mid] &lt;= target) { ans = mid; l = mid + 1; }
        else r = mid - 1;
    }
    return ans;
}

// ====== 最大值最小 / 最小值最大（答案二分） ======
// 例：分成m组使最大组和最小
bool can_split(vector&lt;int&gt;&amp; nums, int max_sum, int m) {
    int cnt = 1, sum = 0;
    for (int x : nums) {
        if (sum + x &gt; max_sum) { cnt++; sum = x; }
        else sum += x;
    }
    return cnt &lt;= m;
}
int split_array(vector&lt;int&gt;&amp; nums, int m) {
    int l = *max_element(nums.begin(), nums.end());
    int r = accumulate(nums.begin(), nums.end(), 0);
    while (l &lt; r) {
        int mid = l + (r - l) / 2;
        if (can_split(nums, mid, m)) r = mid;
        else l = mid + 1;
    }
    return l;
}
</code></pre>

<!-- ---------- 2.7 DFS / BFS ---------- -->
<h3>2.7 DFS / BFS 模板</h3>

<pre><code>// ====== DFS（递归） ======
void dfs(int u, vector&lt;vector&lt;int&gt;&gt;&amp; g, vector&lt;bool&gt;&amp; vis) {
    vis[u] = true;
    for (int v : g[u])
        if (!vis[v]) dfs(v, g, vis);
}

// ====== DFS（栈，迭代） ======
void dfs_iter(int start, vector&lt;vector&lt;int&gt;&gt;&amp; g) {
    vector&lt;bool&gt; vis(g.size());
    stack&lt;int&gt; st;
    st.push(start);
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (vis[u]) continue;
        vis[u] = true;
        for (int v : g[u])
            if (!vis[v]) st.push(v);
    }
}

// ====== BFS（最短路径/层序遍历） ======
vector&lt;int&gt; bfs(int start, vector&lt;vector&lt;int&gt;&gt;&amp; g) {
    int n = g.size();
    vector&lt;int&gt; dist(n, -1);
    queue&lt;int&gt; q;
    q.push(start);
    dist[start] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}

// ====== 二维网格DFS ======
int dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
void dfs_grid(int x, int y, vector&lt;vector&lt;int&gt;&gt;&amp; grid) {
    int m = grid.size(), n = grid[0].size();
    if (x &lt; 0 || x &gt;= m || y &lt; 0 || y &gt;= n) return;
    if (grid[x][y] == 0) return;        // 已访问或障碍
    grid[x][y] = 0;                     // 标记已访问
    for (auto&amp; d : dirs) dfs_grid(x+d[0], y+d[1], grid);
}
</code></pre>

<!-- ---------- 2.8 并查集 ---------- -->
<h3>2.8 并查集 (Union-Find)</h3>

<pre><code>class UnionFind {
    vector&lt;int&gt; parent, rank;
public:
    UnionFind(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i &lt; n; ++i) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);  // 路径压缩
        return parent[x];
    }

    void unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return;
        // 按秩合并
        if (rank[rx] &lt; rank[ry]) parent[rx] = ry;
        else if (rank[rx] &gt; rank[ry]) parent[ry] = rx;
        else { parent[ry] = rx; rank[rx]++; }
    }

    bool same(int x, int y) { return find(x) == find(y); }

    int count_sets() {
        int cnt = 0;
        for (int i = 0; i &lt; parent.size(); ++i)
            if (parent[i] == i) cnt++;
        return cnt;
    }
};
</code></pre>

<!-- ---------- 2.9 单调栈 ---------- -->
<h3>2.9 单调栈</h3>

<pre><code>// ====== 下一个更大元素（单调递减栈） ======
vector&lt;int&gt; next_greater(vector&lt;int&gt;&amp; nums) {
    int n = nums.size();
    vector&lt;int&gt; ans(n, -1);
    stack&lt;int&gt; st;  // 存下标，栈内值单调递减
    for (int i = 0; i &lt; n; ++i) {
        while (!st.empty() &amp;&amp; nums[st.top()] &lt; nums[i]) {
            ans[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }
    return ans;
}

// ====== 每日温度（求间隔天数） ======
vector&lt;int&gt; daily_temperatures(vector&lt;int&gt;&amp; T) {
    int n = T.size();
    vector&lt;int&gt; ans(n, 0);
    stack&lt;int&gt; st;
    for (int i = 0; i &lt; n; ++i) {
        while (!st.empty() &amp;&amp; T[st.top()] &lt; T[i]) {
            ans[st.top()] = i - st.top();
            st.pop();
        }
        st.push(i);
    }
    return ans;
}

// ====== 柱状图最大矩形（单调递增栈） ======
int largest_rectangle(vector&lt;int&gt;&amp; heights) {
    heights.push_back(0);  // 哨兵
    stack&lt;int&gt; st;
    int ans = 0;
    for (int i = 0; i &lt; heights.size(); ++i) {
        while (!st.empty() &amp;&amp; heights[st.top()] &gt; heights[i]) {
            int h = heights[st.top()]; st.pop();
            int w = st.empty() ? i : i - st.top() - 1;
            ans = max(ans, h * w);
        }
        st.push(i);
    }
    heights.pop_back();
    return ans;
}
</code></pre>

<!-- ---------- 2.10 前缀和 ---------- -->
<h3>2.10 前缀和 &amp; 差分</h3>

<pre><code>// ====== 一维前缀和 ======
vector&lt;int&gt; prefix(n + 1, 0);
for (int i = 0; i &lt; n; ++i)
    prefix[i + 1] = prefix[i] + nums[i];
// 区间和 [l, r]：prefix[r+1] - prefix[l]

// ====== 二维前缀和 ======
vector&lt;vector&lt;int&gt;&gt; pre(m+1, vector&lt;int&gt;(n+1, 0));
for (int i = 0; i &lt; m; ++i)
    for (int j = 0; j &lt; n; ++j)
        pre[i+1][j+1] = pre[i+1][j] + pre[i][j+1] - pre[i][j] + mat[i][j];
// 子矩阵和 [r1,c1]→[r2,c2]：pre[r2+1][c2+1]-pre[r1][c2+1]-pre[r2+1][c1]+pre[r1][c1]

// ====== 差分数组（区间增减） ======
vector&lt;int&gt; diff(n + 1, 0);
// [l, r] 加 val：
diff[l] += val; diff[r + 1] -= val;
// 还原：
for (int i = 1; i &lt; n; ++i) diff[i] += diff[i-1];
</code></pre>

<!-- ---------- 2.11 回溯 ---------- -->
<h3>2.11 回溯模板（排列 / 组合 / 子集）</h3>

<pre><code>// ====== 通用回溯框架 ======
vector&lt;vector&lt;int&gt;&gt; ans;
vector&lt;int&gt; path;

void backtrack(/* 参数 */) {
    if (/* 终止条件 */) {
        ans.push_back(path);
        return;
    }
    for (/* 每个选择 */) {
        if (/* 剪枝 */) continue;
        path.push_back(choice);       // 做选择
        backtrack(/* 更新参数 */);     // 递归
        path.pop_back();              // 撤销选择
    }
}

// ====== 全排列（无重复） ======
void permute(vector&lt;int&gt;&amp; nums, vector&lt;bool&gt;&amp; used) {
    if (path.size() == nums.size()) { ans.push_back(path); return; }
    for (int i = 0; i &lt; nums.size(); ++i) {
        if (used[i]) continue;
        // 去重：if (i>0 && nums[i]==nums[i-1] && !used[i-1]) continue;
        used[i] = true;
        path.push_back(nums[i]);
        permute(nums, used);
        path.pop_back();
        used[i] = false;
    }
}

// ====== 组合 C(n, k) ======
void combine(int start, int n, int k) {
    if (path.size() == k) { ans.push_back(path); return; }
    for (int i = start; i &lt;= n; ++i) {
        path.push_back(i);
        combine(i + 1, n, k);  // 组合 i+1；排列从0开始
        path.pop_back();
    }
}

// ====== 子集 ======
void subsets(vector&lt;int&gt;&amp; nums, int start) {
    ans.push_back(path);           // 每个节点都是答案
    for (int i = start; i &lt; nums.size(); ++i) {
        path.push_back(nums[i]);
        subsets(nums, i + 1);
        path.pop_back();
    }
}
</code></pre>

<!-- ---------- 2.12 位运算 ---------- -->
<h3>2.12 位运算常用技巧</h3>

<pre><code>// ====== 基础位运算 ======
x &amp; (1 &lt;&lt; k)           // 判断第k位是否为1
x |= (1 &lt;&lt; k)           // 第k位置1
x &amp;= ~(1 &lt;&lt; k)          // 第k位置0
x ^= (1 &lt;&lt; k)           // 第k位取反
x &amp; (x - 1)             // 消去最低位的1（Brian Kernighan）
x &amp; -x                  // 取出最低位的1（lowbit）
x ^ x = 0               // 自反性

// ====== 统计1的个数 ======
int popcount(int x) {
    int cnt = 0;
    while (x) { x &amp;= (x - 1); cnt++; }
    return cnt;
}
// 或使用 __builtin_popcount(x) (GCC/Clang)

// ====== 判断奇偶 ======
x &amp; 1                    // 1→奇数，0→偶数

// ====== 乘除2的幂 ======
x &lt;&lt; k                  // x * 2^k
x &gt;&gt; k                  // x / 2^k

// ====== 只出现一次的数字 ======
// 数组中有且仅有一个数出现一次，其余都出现两次 → 全异或
int ans = 0;
for (int x : nums) ans ^= x;

// ====== 枚举子集掩码 ======
// 枚举 mask 的所有子集
for (int sub = mask; sub; sub = (sub - 1) &amp; mask) {
    // sub 是 mask 的一个子集
}
</code></pre>

<!-- ---------- 2.13 动态规划 ---------- -->
<h3>2.13 动态规划速记</h3>

<pre><code>// ====== 0-1 背包 ======
// dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])
// 一维优化（逆序）：
for (int i = 0; i &lt; n; ++i)
    for (int w = W; w &gt;= wt[i]; --w)
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);

// ====== 完全背包（每种无限个） ======
// 一维（正序）：
for (int i = 0; i &lt; n; ++i)
    for (int w = wt[i]; w &lt;= W; ++w)
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);

// ====== 最长公共子序列 LCS ======
// dp[i][j] = dp[i-1][j-1]+1            (a[i]==b[j])
//          = max(dp[i-1][j], dp[i][j-1])  (a[i]!=b[j])

// ====== 最长递增子序列 LIS ======
// 方法1：DP O(n²)
// 方法2：贪心+二分 O(n log n)
vector&lt;int&gt; tails;
for (int x : nums) {
    auto it = lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) tails.push_back(x);
    else *it = x;
}
// tails.size() 即 LIS 长度

// ====== 编辑距离 ======
// dp[i][j] = dp[i-1][j-1]              (a[i]==b[j])
//          = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
</code></pre>

<!-- ---------- 2.14 链表 ---------- -->
<h3>2.14 链表常用操作</h3>

<pre><code>// ====== 反转链表 ======
ListNode* reverse(ListNode* head) {
    ListNode *prev = nullptr, *cur = head;
    while (cur) {
        ListNode* next = cur-&gt;next;
        cur-&gt;next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}

// ====== 快慢指针找中点 ======
ListNode* middle(ListNode* head) {
    auto *slow = head, *fast = head;
    while (fast &amp;&amp; fast-&gt;next) {
        slow = slow-&gt;next;
        fast = fast-&gt;next-&gt;next;
    }
    return slow;
}

// ====== 判断环 ======
bool has_cycle(ListNode* head) {
    auto *slow = head, *fast = head;
    while (fast &amp;&amp; fast-&gt;next) {
        slow = slow-&gt;next;
        fast = fast-&gt;next-&gt;next;
        if (slow == fast) return true;
    }
    return false;
}

// ====== 删除倒数第N个 ======
ListNode* remove_nth_from_end(ListNode* head, int n) {
    ListNode dummy{0, head};
    auto *fast = &amp;dummy, *slow = &amp;dummy;
    for (int i = 0; i &lt;= n; ++i) fast = fast-&gt;next;
    while (fast) { fast = fast-&gt;next; slow = slow-&gt;next; }
    slow-&gt;next = slow-&gt;next-&gt;next;
    return dummy.next;
}
</code></pre>

<!-- ---------- 2.15 排序 ---------- -->
<h3>2.15 排序算法速写</h3>

<pre><code>// ====== 快速排序（分区） ======
int partition(vector&lt;int&gt;&amp; v, int l, int r) {
    int pivot = v[r], i = l;
    for (int j = l; j &lt; r; ++j)
        if (v[j] &lt; pivot) swap(v[i++], v[j]);
    swap(v[i], v[r]);
    return i;
}
void quicksort(vector&lt;int&gt;&amp; v, int l, int r) {
    if (l &gt;= r) return;
    int p = partition(v, l, r);
    quicksort(v, l, p - 1);
    quicksort(v, p + 1, r);
}

// ====== 归并排序 ======
void mergesort(vector&lt;int&gt;&amp; v, int l, int r, vector&lt;int&gt;&amp; tmp) {
    if (l &gt;= r) return;
    int mid = l + (r - l) / 2;
    mergesort(v, l, mid, tmp);
    mergesort(v, mid + 1, r, tmp);
    int i = l, j = mid + 1, k = l;
    while (i &lt;= mid &amp;&amp; j &lt;= r)
        tmp[k++] = v[i] &lt; v[j] ? v[i++] : v[j++];
    while (i &lt;= mid) tmp[k++] = v[i++];
    while (j &lt;= r)   tmp[k++] = v[j++];
    for (i = l; i &lt;= r; ++i) v[i] = tmp[i];
}

// ====== 堆排序 ======
void heapsort(vector&lt;int&gt;&amp; v) {
    make_heap(v.begin(), v.end());        // 建堆
    sort_heap(v.begin(), v.end());        // 堆排序
}
</code></pre>

<!-- ============================================================ -->
<!-- FOOTER -->
<!-- ============================================================ -->

<hr>
<p style="text-align:center;color:#999;">
    C++ STL 速记 &amp; 编程考题模板 — 持续更新中
</p>

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
<script>
document.querySelectorAll('pre code').forEach(function(block) {
    block.classList.add('language-cpp');
});
hljs.highlightAll();
</script>

</body>
</html>
{% endraw %}
