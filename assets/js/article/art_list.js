$(function () {

  let layer = layui.layer
  let form = layui.form
  let laypage = layui.laypage

  // 定义美化时间的过滤器 
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date);

    let y = dt.getFullYear();
    let m = padZero(dt.getMonth() + 1);
    let d = padZero(dt.getDate());

    let hh = padZero(dt.getHours());
    let mm = padZero(dt.getMinutes());
    let ss = padZero(dt.getSeconds());

    return y + '年' + m + '月' + d + '日' + ' ' + hh + ':' + mm + ':' + ss;
  }

  // 定义补零的函数
  function padZero(n) {
    return n > 9 ? n : '0' + n;
  }

  // 定义一个查询的参数对象，将来请求数据的时候，需要将请求参数对象提交到服务器
  let q = {
    pagenum: 1,   //页码值，默认请求第一页的数据
    pagesize: 2,    //每页显示几条数据，默认每页显示两条
    cate_id: '',    //文章分类的id
    state: ''       //文章的发布状态
  }

  initTable()
  initCate()

  // 获取文章列表信息的方法
  function initTable() {
    $.ajax({
      method: "GET",
      url: '/my/article/list',
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取文章列表信息失败！')
        }
        // console.log(res);
        // 使用模板引擎来渲染页面的数据
        let htmlStr = template('tpl-table', res);
        $('tbody').html(htmlStr);

        // 调用渲染分页的方法
        renderPage(res.total)
      }
    });
  }


  // 初始化文章分类的方法
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败!')
        }
        // 使用模板引擎渲染分类的可选项
        let htmlStr = template('tpl-cate', res);

        $('[name=cate_id]').html(htmlStr);

        // 通知layui重新渲染表单区域的UI结构
        form.render()
      }
    })
  }


  // 为筛选表单绑定submit事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault();

    // 获取表单中选中项的值
    let cate_id = $('[name=cate_id]').val()
    let state = $('[name=state]').val()

    // 为查询查询参数对象 q 中对应的属性赋值
    q.cate_id = cate_id;
    q.state = state;

    // 根据最新的筛选条件，重新渲染表单数据
    initTable()
  })


  // 定义渲染分页的方法
  function renderPage(total) {

    // 调用laypage.render( )方法来渲染分页结构
    laypage.render({
      elem: 'pageBox',  //分页容器的id
      count: total,  //总数据条数
      limit: q.pagesize,  // 每页显示几条数据
      curr: q.pagenum,  // 设置默认被选中的分页
      layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
      limits: [2, 4, 6, 8],

      // 分页发生切换的时候，触发jump回调
      jump: function (obj, first) {
        // console.log(obj.curr);

        // 把最新的页码值 赋值到 q 这个查询参数对象中
        q.pagenum = obj.curr;
        // 把最新的条目数 赋值到 q 这个查询参数对象的pagesize属性中
        q.pagesize = obj.limit

        // 根据最新的 q 获取最新的数据列表 并渲染表格
        if (!first) {
          initTable();
        }

      }
    })

  }


  // 通过代理的形式 为删除按钮绑b定点击事件处理函数
  $('tbody').on('click', '.btn-delete', function () {
    // 获取删除按钮的个数 
    let len = $('.btn-delete').length
    console.log(len);
    // 获取到文章的Id
    let id = $(this).attr('data-id')

    // 询问用户是否要删除数据

    layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
      $.ajax({
        method: 'GET',
        url: '/my/article/delete/' + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('删除文章失败！')
          }
          layer.msg('删除文章成功！')

          // 当数据删除完成后 需要判断当前这一页中是否还有剩余的数据
          // 如果没有剩bi余的数据了 则让页码值 -1 之后再重复新调用initTable()方法
          if (len === 1) {
            // 如果len的值等于1 证明删除完毕后 页面就没有任何数据了
            // 页码值最小必须是1

            q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
          }

          initTable()
        }

      })

      layer.close(index);
    });
  })
})