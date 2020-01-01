/*
 *  关于audio的一些常用属性
 *      duration：播放的总时间(s)
 *      currentTime：当前播放的时间(s)
 *      ended：是否播放完毕
 *      paused：当前是否为暂停
 *      volume：控制音量（0-1）
 *
 *     事件：
 *      canplay:可以正常播放（但可能过程中会出现卡顿）
 *      canplaythrough:资源加载完毕可以顺畅播放
 *      ended:播放完成
 *      loadedmetadata：资源的基础信息已经加载完成
 *      loadeddata：整个资源加载完成
 *      pause：触发暂停
 *      play：触发了播放
 *      playing：正在播放中
 */


/*LOADING*/
let loadingRender = (function () {
    let $loadingBOx = $('.loadingBox'),
        $current = $loadingBOx.find('.current');

    let imgDate = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];

    // RUN:预加载图片
    let n = 0,
        len = imgDate.length;
    let run = function run(callback) {
        imgDate.forEach(item => {
            let tempImg = new Image;
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width', ((++n) / len) * 100 + '%');

                //  加载完成,执行回调函数（让当前 loading 页面消失）
                if (n === len) {
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        })
    };

    //  maxDelay 设置最长等待时间（假设为10秒，如果 已经达到90%以上，我们可以正常访问了；如果没达到，直接提示用户网络不好，请重试）
    let delayTimer = null;
    let maxDelay = function maxDelay(callback) {
        delayTimer = setTimeout(() => {
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('您当前网络状况不佳 ，请重试');
            window.location.href = 'http://www.baidu.com';//此时不应在继续加载图片，而是跳转或者关闭页面
        }, 10000);
    };

    //done完成
    let done = function done() {
        //停留一秒再移除进入下一张
        let timer = setTimeout(() => {
            $loadingBOx.remove();
            phoneRender.init();
        }, 1000);
    };

    return {
        init: function () {
            $loadingBOx.css('display', 'block');
            run(done);
            maxDelay(done);
        }
    }
})();

// loadingRender.init();

/*PHONE*/
let phoneRender = (function () {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];
    let answerMarkTouch = function answerMarkTouch() {
        console.log('ok');
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove();//一定要先暂停在移除，否则即使移除还会播放声音
        //show-hang
        $hang.css('transform', 'translateY(0rem)');
        $time.css('display', 'block');
        introduction.play();
        computedTime();
    };
    //计算播放时间
    let autoTimer = null;
    let computedTime = function computedTime() {
        //我们让audio播放，首先会加载资源，部分资源加载完才会播放，才会计算出总时间，所以我们把获取的信息放到canplay事件中
        let duration = 0;
        introduction.oncanplay = function () {
            duration = introduction.duration;
            console.log(duration);
        };
        autoTimer = setInterval(() => {
            let val = introduction.currentTime,
                duration = introduction.duration;
            //播放完成
            if (val >= duration) {
                clearInterval(autoTimer);
                closePhone();
                return;
            }
            let minute = Math.floor(val / 60),
                second = Math.floor(val - minute / 60);
            minute = minute < 10 ? '0' + minute : minute;
            second = second < 10 ? '0' + second : second;
            $time.html(`${minute}:${second}`);
        }, 1000);
    };

    //关闭phone
    let closePhone = function closePhone() {
        clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        messageRender.init();
    };

    return {
        init: function () {
            //    播放bell
            $phoneBox.css('display', 'block');
            answerBell.play();
            answerBell.volume = 0.3;
            //    点击ANWSER-MARK
            // $answerMarkLink.on('click',answerMarkTouch);
            $answerMarkLink.tap(answerMarkTouch);
            // $hangMarkLink.on('click',closePhone);
            $hangMarkLink.tap(closePhone);
        }
    }
})();

/*MESSAGE*/
let messageRender = (function () {
    let $messageBox = $('.messageBox'),
        demonMusic = $('#demonMusic')[0],
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $messageBox.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit');
    let step = -1,//记录当前展示信息的索引
        total = $messageList.length + 1,//记录的是信息的总长度+自己发的一条
        autoTimer = null,
        interval = 2000;//记录信息相继出现的间隔时间
    //展示信息
    let tt = 0;
    let showMessage = function showMessage() {
        ++step;
        if (step === 2) {//此时已经展示两条了，此时调出键盘，手动发送
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur = $messageList.eq(step);
        $cur.addClass('active');
        if (step > 3) {
            //    展示条数是四条或更多，让wrapper向上运动新展示这条高度的距离
            /*            let curH = $cur[0].offsetHeight,
                            wraT = parseFloat($wrapper.css('top'));
                        $wrapper.css('top',wraT-curH);*/

            let curH = $cur[0].offsetHeight;
            tt -= curH;
            $wrapper.css('transform', `translateY(${tt}px)`);
        }
        if (step >= total - 1) {
            //已经展示完成
            clearInterval(autoTimer);
            closeMessage();
        }
    };

    //手动发送
    let handleSend = function handleSend() {
        $keyBoard.css('transform', 'translateY(0rem)').one('transitionend', () => {
            //transitionend： on 监听transition动画结束事件；有几个样式属性发生改变执行过渡，就触发几次。用one方法只会触发一次
            let str = '好的，那我来介绍一下我自己',
                n = -1,
                textTimer = null;
            textTimer = setInterval(() => {
                let originHtml = $textInp.html();
                $textInp.html(originHtml + str[++n]);
                if (n >= str.length - 1) {
                    clearInterval(textTimer);
                    $submit.css('display', 'block');
                }
            }, 150);
        });
    };

    //点击submit
    let handleSubmit = function handleSubmit() {
        //把新创建的LI增加到页面中第二个LI的后面
        $(`<li class="self">
                <i class="arrow"></i>
                <img src="img/zf_messageStudent.png" alt="" class="pic">
                ${$textInp.html()}
            </li>`).insertAfter($messageList.eq(1)).addClass('active');

        $messageList = $messageBox.find('li');//把新的LI放到页面中应该重新获取LI让messageList和页面中的LI对应，方便后期跟就索引展示对应的LI

        //该消失的消失
        $textInp.html('');
        $submit.css('display', 'none');
        $keyBoard.css('transform', 'translateY(3.7rem)');

        //继续展示剩余的消息
        autoTimer = setInterval(showMessage, interval);

        //    把上面的消息网上走；
    };

    //关闭message区域
    let closeMessage = function closeMessage() {
        let delayTimer = setTimeout(() => {
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer);
            cubeRender.init();
        }, interval);
    };

    return {
        init: function () {
            $messageBox.css('display', 'block');
            //加载模块立即展示一条信息，后期间隔interval在发送一条消息
            showMessage();
            autoTimer = setInterval(showMessage, interval);
            //submit
            $submit.tap(handleSubmit);
            //music
            demonMusic.play();
        }
    }
})();

/*CUBE*/
let cubeRender = (function () {
    let $cubeBox = $('.cubeBox'),
        $cube = $('.cube'),
        $cubeList = $cube.find('li');
    let start = function start(ev) {
        // console.log(ev, this);
        //记录手指按下是的起始位置
        let point = ev.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    };
    let move = function move(ev) {
        //用最新位置减去起始位置记录X和Y偏移
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;
    };
    let end = function end(ev) {
        let {changeX, changeY, rotateX, rotateY} = this,
            isMove = false;
        //验证是否发生滑动（操作误差判断）
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;
        //    只有滑动才处理
        if (isMove === true) {
            //    1.左右滑动：changeX=>RotateY(正比)
            //    2.上下滑动：changeY=>RotateX(反比：change越大，rotate越小)
            //    3.为了让每次旋转角度小一点，我们可以把移动距离的1/3作为旋转角度
            rotateX = rotateX - changeY / 3;
            rotateY = rotateY + changeX / 3;
            //    赋值给模仿盒子
            $(this).css('transform', `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //    让当前旋转的角度成为下一次起始的角度
            this.rotateX = rotateX;
            this.rotateY = rotateY;
        }
        //    清空其他记录的自定义属性值
        ['strX', 'strY', 'changeX', 'changeY'].forEach(item => this[item] = null);
    };

    return {
        init: function () {
            $cubeBox.css('display', 'block');
            //   手指操作cube让其跟着旋转
            let cube = $cube[0];
            cube.rotateX = -35;
            cube.rotateY = 35;//记录初始旋转角度，存储到自定义属性上
            $cube.on('touchstart', start)
                .on('touchmove', move)
                .on('touchend', end);

        //    点击每一个面跳转到详情区域对应页面
            $cubeList.tap(function () {
                $cubeBox.css('display', 'none');
                let index=$(this).index();
                detailRender.init(index);
            });
        }
    }
})();

/*DETAIL*/
let detailRender = (function () {
    let $detailBox = $('.detailBox'),
        swiper = null,
    $dl=$('.page1>dl');
    let swiperInit = function swiperInit() {
        swiper = new Swiper('.swiper-container', {
            // initialSlide:1;//初始slide索引
            // direction:'horizontal/vertical'//控制滑动方向
            effect: 'coverflow',
            // loop:true//3D效果切换设置loop的时候，偶尔会出现无法切换的情况无缝切换到原理把真实第一张放到末尾，把真实最后一张也克隆一封放到开始（如果真是有五张，那么wrapper中会有七张）
            onInit: move,
            onTransitionEnd:move
        })
        // 实例的属性：
        // 1.activeIndex：当前展示slide的索引；
        // 2.slides：获取所有的slide（数组）
        /* ===实例的共有方法：===*/
        // 1.slideTo：切换到指定索引的slide
    };

    let move=function move(swiper) {
    //    swiper是当前创建的实例
    //    1.判断当前slide是否为第一个，如果是让3D菜单展开，否则收起
        let activeIn=swiper.activeIndex,
            slideAry=swiper.slides;
        if (activeIn===0){
            //    page1
            $dl.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0.5
            });
            $dl.makisu('open');//close/toggle/open
        }else{
            $dl.makisu({
                selector:'dd',
                speed:0
            });
            $dl.makisu('close');//close/toggle/open
        }

    //    2.滑动到那一页，把当前页面设置对应的ID，其余移除
        slideAry.forEach((item,index)=>{
            if (activeIn===index){
                item.id=`page${index+1}`;
                return;
            }
            item.id=null;
        });
    };


    return {
        init: function (index=0) {
            $detailBox.css('display', 'block');
            if (!swiper){//防止重复初始化
                swiperInit();
            }
            swiper.slideTo(index,0);//直接运动到具体的slide页面,0代表直接切换没有运动效果
        }
    }
})();


//开发程中，由于当前板块众多（每个板块都是一个单例），我们最好规划一种机制，通过表识的判断让程序只执行对应模块内容（HASH路由控制）

let url = window.location.href,//=>获取当前页面的URL地址  location.href='xxx'这种写法是让其跳转到某一个页面
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.substr(well + 1);
switch (hash) {
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailRender.init();
        break;
    default :
        loadingRender.init();
}




