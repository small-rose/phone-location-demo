// worker.js —— 纯函数式，无框架依赖
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

    const tel = url.searchParams.get('tel');
    if (!tel || !/^1[3-9]\d{9}$/.test(tel)) {
      return Response.json({ success: false, message: '请输入有效的 11 位手机号' }, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }

    try {
      const res = await fetch(`http://tcc.taobao.com/cc/json/mobile_tel_segment.htm?tel=${tel}`);
      const text = await res.text();
      const jsonMatch = text.match(/__GetZoneResult_\s*=\s*({[\s\S]*?});/);
      if (!jsonMatch || !jsonMatch[1]) throw new Error('API parse failed');
      
      const data = JSON.parse(jsonMatch[1]);
      return Response.json({
        success: true,
        tel: data.telString || tel,
        province: data.province || '未知',
        city: data.city || '未知',
        carrier: data.catName || data.carrier || '未知',
        isp: data.isp || '未知'
      }, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    } catch (err) {
      console.error(err);
      return Response.json({ success: false, message: '查询失败，请稍后重试' }, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }
  }
};
