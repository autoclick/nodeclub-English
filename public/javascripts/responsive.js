$(document).ready(function () {
  var $responsiveBtn = $('#responsive-sidebar-trigger'),
    $sidebarMask = $('#sidebar-mask'),
    $sidebar = $('#sidebar'),
    $main = $('#main'),
    winWidth = $(window).width(),
    startX = 0,
    startY = 0,
    delta = {
      x: 0,
      y: 0
    },
    swipeThreshold = winWidth / 3,
    toggleSideBar = function () {
      var isShow = $responsiveBtn.data('is-show'),
        mainHeight = $main.height(),
        sidebarHeight = $sidebar.outerHeight();
      $sidebar.css({right: isShow ? -300 : 0});
      $responsiveBtn.data('is-show', !isShow);
      if (!isShow && mainHeight < sidebarHeight) {
        $main.height(sidebarHeight);
      }
      $sidebarMask[isShow ? 'fadeOut' : 'fadeIn']().height($('body').height());
    },
    touchstart = function (e) {
      var touchs = e.targetTouches;
      startX = +touchs[0].pageX;
      startY = +touchs[0].pageY;
      delta.x = delta.y = 0;
      document.body.addEventListener('touchmove', touchmove, false);
      document.body.addEventListener('touchend', touchend, false);
    },
    touchmove = function (e) {
      var touchs = e.changedTouches;
      delta.x = +touchs[0].pageX - startX;
      delta.y = +touchs[0].pageY - startY;
      // When the horizontal distance is greater than the vertical distance ， Was considered to be a user wants to slide open the right side bar 
      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        e.preventDefault();
      }
    },
    touchend = function (e) {
      var touchs = e.changedTouches,
        isShow = $responsiveBtn.data('is-show');
      delta.x = +touchs[0].pageX - startX;
      // Right-hand column is not displayed && User touch Point on the right side of the screen 1/4 Region &&move When the distance is greater than the threshold ， Open the right-hand column 
      if (!isShow && (startX > winWidth * 3 / 4) && Math.abs(delta.x) > swipeThreshold) {
        $responsiveBtn.trigger('click');
      }
      // Right sidebar display && User touch Point on the left side of the screen 1/4 Region &&move When the distance is greater than the threshold ， Close the right side bar 
      if (isShow && (startX < winWidth * 1 / 4) && Math.abs(delta.x) > swipeThreshold) {
        $responsiveBtn.trigger('click');
      }
      startX = startY = 0;
      delta.x = delta.y = 0;
      document.body.removeEventListener('touchmove', touchmove, false);
      document.body.removeEventListener('touchend', touchend, false);
    };

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    document.body.addEventListener('touchstart', touchstart);
  }

  $responsiveBtn.on('click', toggleSideBar);

  $sidebarMask.on('click', function () {
    $responsiveBtn.trigger('click');
  });

});