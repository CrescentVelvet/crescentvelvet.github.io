---
permalink: /exam_notes/
title: "信创考试知识点"
excerpt: "C++ STL速记与编程考题模板"
author_profile: false
---

{% raw %}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>信创考试知识点</title>
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
        td code {
            font-size: 1.05em;
            line-height: 2;
        }
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
<tr><td>初始化</td><td><code>vector&lt;int&gt; v;<br>vector&lt;int&gt; v{1,2,3};</code></td><td>空 / 列表初始化</td></tr>
<tr><td>尾部增删</td><td><code>v.push_back(x);</code></td><td>O(1) 均摊</td></tr>
<tr><td>随机访问</td><td><code>v[i];</code></td><td>下标访问</td></tr>
<tr><td>大小</td><td><code>v.size();<br>v.empty();</code></td><td></td></tr>
<tr><td>删除</td><td><code>v.erase(pos);</code></td><td>O(n)</td></tr>
<tr><td>清空</td><td><code>v.clear();</code></td><td></td></tr>
<tr><td>排序</td><td><code>sort(v.begin(), v.end());</code></td><td>升序</td></tr>
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
<tr><td>查找</td><td><code>s.find(t);</code></td><td>返回下标或 string::npos</td></tr>
<tr><td>替换</td><td><code>s.replace(pos, len, t);</code></td><td></td></tr>
<tr><td>删除</td><td><code>s.erase(pos, len);</code></td><td></td></tr>
<tr><td>数值转换</td><td><code>stoi(s);<br>to_string(x);</code></td><td>string ↔ 数值</td></tr>
<tr><td>C串</td><td><code>s.c_str();</code></td><td>返回 const char*</td></tr>
<tr><td>连接</td><td><code>s += t;</code></td><td></td></tr>
<tr><td>比较</td><td><code>s == t;</code></td><td>按字典序</td></tr>
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
<tr><td>插入/更新</td><td><code>m[k] = v;</code></td><td>不存在则插入默认值</td></tr>
<tr><td>删除</td><td><code>m.erase(k);</code></td><td></td></tr>
<tr><td>查找</td><td><code>m.find(k);<br>m.count(k);</code></td><td>find返回迭代器 / count返回0或1</td></tr>
<tr><td>二分</td><td><code>m.lower_bound(k);</code></td><td>仅 map 支持</td></tr>
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
<tr><td>大小</td><td><code>pq.size();</code></td><td></td></tr>
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

// ====== 十六进制字符串 ↔ 字节数组 ======
// hex → bytes: "0A1F" → {0x0A, 0x1F}
vector&lt;uint8_t&gt; hex_to_bytes(const string&amp; hex) {
    vector&lt;uint8_t&gt; bytes;
    for (size_t i = 0; i + 1 &lt; hex.length(); i += 2)
        bytes.push_back((uint8_t)stoi(hex.substr(i, 2), nullptr, 16));
    return bytes;
}

// bytes → hex: {0x0A, 0x1F} → "0a1f"
string bytes_to_hex(const vector&lt;uint8_t&gt;&amp; bytes) {
    stringstream ss;
    for (uint8_t b : bytes)
        ss &lt;&lt; hex &lt;&lt; setw(2) &lt;&lt; setfill('0') &lt;&lt; (int)b;
    return ss.str();
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

// ====== 滑动窗口统计频次 ======
// 统计每个长度为k的窗口中不同字符数 / 某字符出现次数
vector&lt;int&gt; window_freq_count(const string&amp; s, int k) {
    int cnt[26] = {};
    vector&lt;int&gt; ans;
    for (int i = 0; i &lt; s.size(); ++i) {
        cnt[s[i] - 'a']++;
        if (i &gt;= k) cnt[s[i - k] - 'a']--;
        if (i &gt;= k - 1) {
            int uniq = 0;
            for (int c : cnt) if (c &gt; 0) uniq++;
            ans.push_back(uniq);
        }
    }
    return ans;
}

// 用 unordered_map 统计任意字符（非小写字母）
vector&lt;int&gt; window_freq_generic(const string&amp; s, int k) {
    unordered_map&lt;char, int&gt; cnt;
    vector&lt;int&gt; ans;
    for (int i = 0; i &lt; s.size(); ++i) {
        cnt[s[i]]++;
        if (i &gt;= k &amp;&amp; --cnt[s[i - k]] == 0)
            cnt.erase(s[i - k]);
        if (i &gt;= k - 1) ans.push_back(cnt.size());
    }
    return ans;
}

// 定宽窗口中统计频次是否满足某条件（如窗口内某字符频次≥T）
bool window_freq_over_T(const string&amp; s, int k, char target, int T) {
    int cnt = 0;
    for (int i = 0; i &lt; s.size(); ++i) {
        if (s[i] == target) cnt++;
        if (i &gt;= k &amp;&amp; s[i - k] == target) cnt--;
        if (i &gt;= k - 1 &amp;&amp; cnt &gt;= T) return true;
    }
    return false;
}
</code></pre>

<!-- ---------- 2.3 Top K ---------- -->
<h3>2.3 Top K 高频词统计</h3>

<div class="tip"><strong>priority_queue TopK 思路：</strong>
1. 先用 <code>unordered_map</code> 统计每个元素的频次<br>
2. 维护一个大小为 <code>k</code> 的<strong>小顶堆</strong>（堆顶是第k大，堆内是当前top k）<br>
3. 遍历频次表：前 k 个直接入堆；之后若当前频次 > 堆顶频次，则 pop 堆顶再 push 当前<br>
4. 最后堆中 k 个元素即答案（出堆顺序是升序，需反转）<br>
—— 复杂度 O(n log k)，适合 k 远小于 n 的场景
</div>

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

<!-- ---------- 2.16 表达式解析 ---------- -->
<h3>2.16 表达式解析（中缀求值）</h3>

<pre><code>// ====== 中缀表达式求值（+ - * /，含括号） ======
int calculate(const string&amp; s) {
    stack&lt;int&gt; nums;
    stack&lt;char&gt; ops;
    unordered_map&lt;char, int&gt; prio{{'+',1},{'-',1},{'*',2},{'/',2}};

    auto apply = [&amp;]() {
        int b = nums.top(); nums.pop();
        int a = nums.top(); nums.pop();
        char op = ops.top(); ops.pop();
        if (op == '+') nums.push(a + b);
        else if (op == '-') nums.push(a - b);
        else if (op == '*') nums.push(a * b);
        else nums.push(a / b);           // 向零取整
    };

    for (int i = 0; i &lt; s.size(); ++i) {
        if (isspace(s[i])) continue;
        if (isdigit(s[i])) {
            int num = 0;
            while (i &lt; s.size() &amp;&amp; isdigit(s[i]))
                num = num * 10 + (s[i++] - '0');
            nums.push(num);
            --i;
        } else if (s[i] == '(') {
            ops.push('(');
        } else if (s[i] == ')') {
            while (ops.top() != '(') apply();
            ops.pop();                   // 弹出 '('
        } else {
            while (!ops.empty() &amp;&amp; ops.top() != '('
                   &amp;&amp; prio[ops.top()] &gt;= prio[s[i]])
                apply();
            ops.push(s[i]);
        }
    }
    while (!ops.empty()) apply();
    return nums.top();
}

// ====== 中缀表达式 → 逆波兰（后缀） ======
vector&lt;string&gt; infix_to_rpn(const string&amp; s) {
    vector&lt;string&gt; out;
    stack&lt;char&gt; ops;
    unordered_map&lt;char, int&gt; prio{{'+',1},{'-',1},{'*',2},{'/',2}};

    for (int i = 0; i &lt; s.size(); ++i) {
        if (isspace(s[i])) continue;
        if (isdigit(s[i])) {
            string num;
            while (i &lt; s.size() &amp;&amp; isdigit(s[i])) num += s[i++];
            out.push_back(num);
            --i;
        } else if (s[i] == '(') {
            ops.push('(');
        } else if (s[i] == ')') {
            while (ops.top() != '(') {
                out.push_back(string(1, ops.top()));
                ops.pop();
            }
            ops.pop();
        } else {
            while (!ops.empty() &amp;&amp; ops.top() != '('
                   &amp;&amp; prio[ops.top()] &gt;= prio[s[i]]) {
                out.push_back(string(1, ops.top()));
                ops.pop();
            }
            ops.push(s[i]);
        }
    }
    while (!ops.empty()) {
        out.push_back(string(1, ops.top()));
        ops.pop();
    }
    return out;
}

// ====== 逆波兰求值 ======
int eval_rpn(const vector&lt;string&gt;&amp; tokens) {
    stack&lt;int&gt; st;
    for (auto&amp; t : tokens) {
        if (isdigit(t[0]) || (t.size() &gt; 1 &amp;&amp; t[0] == '-'))
            st.push(stoi(t));
        else {
            int b = st.top(); st.pop();
            int a = st.top(); st.pop();
            if (t == "+") st.push(a + b);
            else if (t == "-") st.push(a - b);
            else if (t == "*") st.push(a * b);
            else st.push(a / b);
        }
    }
    return st.top();
}
</code></pre>

<!-- ---------- 2.17 括号匹配 ---------- -->
<h3>2.17 各种括号匹配</h3>

<pre><code>// ====== 基础：多种括号匹配校验 ======
bool is_valid_brackets(const string&amp; s) {
    unordered_map&lt;char, char&gt; pair{
        {')','('}, {']','['}, {'}','{'}
    };
    stack&lt;char&gt; st;
    for (char c : s) {
        if (pair.count(c)) {                     // 是右括号
            if (st.empty() || st.top() != pair[c])
                return false;
            st.pop();
        } else {                                 // 是左括号
            st.push(c);
        }
    }
    return st.empty();
}

// ====== 最长有效括号子串（仅小括号） ======
int longest_valid_parentheses(const string&amp; s) {
    stack&lt;int&gt; st;
    st.push(-1);  // 哨兵下标
    int ans = 0;
    for (int i = 0; i &lt; s.size(); ++i) {
        if (s[i] == '(') {
            st.push(i);
        } else {
            st.pop();
            if (st.empty())
                st.push(i);  // 新的「最后一个未匹配右括号」
            else
                ans = max(ans, i - st.top());
        }
    }
    return ans;
}

// ====== 最少插入次数使括号平衡 ======
int min_insertions_to_balance(const string&amp; s) {
    int need = 0;   // 还需多少右括号
    int ans = 0;
    for (char c : s) {
        if (c == '(') {
            need += 2;                   // 每个 '(' 需要 2 个 ')'
            if (need % 2 == 1) {         // 奇数 → 补一个右括号
                ans++;
                need--;
            }
        } else {
            need--;
            if (need &lt; 0) {             // 右括号多了
                ans++;                   // 补一个左括号
                need = 1;                // 还需一个右括号
            }
        }
    }
    return ans + need;
}

// ====== 生成所有合法括号组合 ======
vector&lt;string&gt; generate_parentheses(int n) {
    vector&lt;string&gt; ans;
    string path;

    function&lt;void(int,int)&gt; dfs = [&amp;](int l, int r) {
        if (l == n &amp;&amp; r == n) { ans.push_back(path); return; }
        if (l &lt; n) { path.push_back('('); dfs(l + 1, r); path.pop_back(); }
        if (r &lt; l) { path.push_back(')'); dfs(l, r + 1); path.pop_back(); }
    };

    dfs(0, 0);
    return ans;
}

// ====== 括号嵌套深度 ======
int max_depth(const string&amp; s) {
    int d = 0, ans = 0;
    for (char c : s) {
        if (c == '(') ans = max(ans, ++d);
        else if (c == ')') d--;
    }
    return ans;
}
</code></pre>

<!-- ---------- 2.18 字符串重复字符压缩计数 ---------- -->
<h3>2.18 字符串压缩（游程编码 RLE）</h3>

<pre><code>// ====== 基础游程编码：aabbbcc → a2b3c2 ======
string rle_encode(const string&amp; s) {
    string res;
    for (int i = 0; i &lt; s.size(); ) {
        int j = i;
        while (j &lt; s.size() &amp;&amp; s[j] == s[i]) ++j;
        res += s[i];
        res += to_string(j - i);
        i = j;
    }
    return res;
}

// ====== 压缩后长度更短才返回，否则返回原串 ======
string compress_if_shorter(const string&amp; s) {
    string res;
    for (int i = 0; i &lt; s.size(); ) {
        int j = i;
        while (j &lt; s.size() &amp;&amp; s[j] == s[i]) ++j;
        res += s[i];
        res += to_string(j - i);
        i = j;
    }
    return res.size() &lt; s.size() ? res : s;
}

// ====== 游程解码：a2b3c2 → aabbbcc ======
string rle_decode(const string&amp; s) {
    string res;
    for (int i = 0; i &lt; s.size(); ) {
        char ch = s[i++];
        int cnt = 0;
        while (i &lt; s.size() &amp;&amp; isdigit(s[i]))
            cnt = cnt * 10 + (s[i++] - '0');
        res.append(cnt, ch);
    }
    return res;
}

// ====== 统计连续重复段数 ======
int count_consecutive_groups(const string&amp; s) {
    if (s.empty()) return 0;
    int groups = 1;
    for (int i = 1; i &lt; s.size(); ++i)
        if (s[i] != s[i - 1]) groups++;
    return groups;
}
// 或利用 unique：
// int groups = unique(s.begin(), s.end()) - s.begin();
</code></pre>

<!-- ---------- 2.19 差值为1的最大索引距离 ---------- -->
<h3>2.19 数组中差值为1的最大索引距离</h3>

<pre><code>// ====== |arr[i] - arr[j]| == 1，求 |i - j| 的最大值 ======
int max_dist_diff_one(const vector&lt;int&gt;&amp; arr) {
    unordered_map&lt;int, int&gt; first;  // value → 首次出现的索引
    int ans = -1;                    // 不存在返回 -1
    for (int i = 0; i &lt; arr.size(); ++i) {
        // 只记录首次出现（最小下标），用当前i作为最大下标求距离
        if (!first.count(arr[i]))
            first[arr[i]] = i;

        if (first.count(arr[i] + 1))
            ans = max(ans, i - first[arr[i] + 1]);
        if (first.count(arr[i] - 1))
            ans = max(ans, i - first[arr[i] - 1]);
    }
    return ans;
}

// ====== 双指针（定差滑动）：找和为target的两数最大索引距离 ======
int max_dist_two_sum(const vector&lt;int&gt;&amp; arr, int target) {
    unordered_map&lt;int, int&gt; first;
    int ans = -1;
    for (int i = 0; i &lt; arr.size(); ++i) {
        if (!first.count(arr[i]))
            first[arr[i]] = i;
        if (first.count(target - arr[i]))
            ans = max(ans, i - first[target - arr[i]]);
    }
    return ans;
}

// ====== 数组中有两个数差值为1的最大索引距离（遍历所有对） ======
// 更通用的写法：记录每个值的最左和最右位置
int max_dist_diff_one_v2(const vector&lt;int&gt;&amp; arr) {
    unordered_map&lt;int, int&gt; left, right;
    for (int i = 0; i &lt; arr.size(); ++i) {
        if (!left.count(arr[i])) left[arr[i]] = i;
        right[arr[i]] = i;
    }
    int ans = -1;
    for (auto&amp; [val, l] : left) {
        if (right.count(val + 1))
            ans = max(ans, abs(l - right[val + 1]));
        // 也检查 right[val+1] 在 l 之前的情况：
        if (right.count(val + 1))
            ans = max(ans, abs(right[val] - left[val + 1]));
    }
    return ans;
}
</code></pre>

<!-- ---------- 2.20 IP地址表达式展开 ---------- -->
<h3>2.20 IP地址表达式展开</h3>

<pre><code>// ====== 含 * 和 范围 的IP表达式展开为具体IP列表 ======
// 支持：192.168.*.*  192.168.1-3.*  10.0.0.1-5
vector&lt;string&gt; expand_ip(const string&amp; pattern) {
    vector&lt;string&gt; parts = split(pattern, '.');

    vector&lt;string&gt; cur{""};
    for (auto&amp; part : parts) {
        vector&lt;string&gt; next;
        // '*' → 0~255
        if (part == "*") {
            for (auto&amp; pre : cur)
                for (int i = 0; i &lt;= 255; ++i)
                    next.push_back(
                        pre + (pre.empty() ? "" : ".") + to_string(i));
        }
        // 'lo-hi' → 范围
        else if (part.find('-') != string::npos) {
            int dash = part.find('-');
            int lo = stoi(part.substr(0, dash));
            int hi = stoi(part.substr(dash + 1));
            for (auto&amp; pre : cur)
                for (int i = lo; i &lt;= hi; ++i)
                    next.push_back(
                        pre + (pre.empty() ? "" : ".") + to_string(i));
        }
        // 固定值
        else {
            for (auto&amp; pre : cur)
                next.push_back(
                    pre + (pre.empty() ? "" : ".") + part);
        }
        cur.swap(next);
    }
    return cur;
}

// ====== IP地址与整数的相互转换 ======
uint32_t ip_to_int(const string&amp; ip) {
    vector&lt;string&gt; parts = split(ip, '.');
    uint32_t res = 0;
    for (auto&amp; p : parts)
        res = (res &lt;&lt; 8) | stoi(p);
    return res;
}

string int_to_ip(uint32_t n) {
    return to_string((n &gt;&gt; 24) &amp; 0xFF) + "." +
           to_string((n &gt;&gt; 16) &amp; 0xFF) + "." +
           to_string((n &gt;&gt; 8)  &amp; 0xFF) + "." +
           to_string(n &amp; 0xFF);
}

// CIDR 展开：192.168.1.0/24 → 所有IP
vector&lt;string&gt; expand_cidr(const string&amp; cidr) {
    int slash = cidr.find('/');
    string ip = cidr.substr(0, slash);
    int bits = stoi(cidr.substr(slash + 1));
    uint32_t base = ip_to_int(ip);
    uint32_t mask = (bits == 0) ? 0 : (~0u &lt;&lt; (32 - bits));
    uint32_t start = base &amp; mask;
    uint32_t count = 1u &lt;&lt; (32 - bits);
    vector&lt;string&gt; ans;
    for (uint32_t i = 0; i &lt; count; ++i)
        ans.push_back(int_to_ip(start + i));
    return ans;
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
