  //setup offline storage
  var marks_store = new Lawnchair({name:'marks', adaptor:'dom indexed-db window-name'}, function(marks) {});
  var mark_count = 0;
  var longest_streak = 0;
  var logged_in = false;
  var first_sync = false;
  //window.scrollTo(0, 1);
  $('html,body').scrollTop(1)

  jQuery.fn.exists = function(){return this.length>0;}

  //pjax start and end functions
  $('#main')
    .bind('pjax:start', function() {
	$('#loading').show();
	userMarks = nil;
    })
    .bind('pjax:end',   function() {
	$('#loading').hide();
	var sub_title = $('.data-title').html();
	$('.subtitle').html(sub_title);
	//window.scrollTo(0, 1);
        startup();
	shareButtonsRefresh();
    });

  $(function(){
      //setTimeout(function() {
      //  window.scrollTo(0, 1);
      //}, 1000);
      startup();
      $('a[data-pjax]').pjax();
      shareButtonsInit();
  });

  var shareButtonsRefresh = function() {
      //re-render the facebook icons (in a div with id of 'content')
      FB.XFBML.parse(document.getElementById('main'));

      //re-render twitter icons by calling the render() method on each
      twttr.widgets.load();

      //g+1 rerender
      $('.g-plusone').attr( 'data-href' , document.location.href );
      gapi.plusone.go("sharing");
  }

  var shareButtonsInit = function() {
    //google plus button
    (function() {
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();

   //twitter
   !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

   //fb
  (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=209648165783031";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
  };

  var startup = function(){
    //display calendar
    $("#calendar").calendarWidget({});

    //one time upgrade user marks if using the old bad key format
    upgradeMarks();

    $('form:first *:input[type!=hidden]:first').focus();
    if($('#calendar').exists() || $('#calendar-container').exists()) {
      if(userPage()) {
        restoreUserMarks();
      } else {
        auth();
        restore_marks();
        //if we reconnect to the net sync again
        $(window).bind("online", reconnected);
      }
    }
     $(".next-month").unbind('click');
     $('.next-month').live('click', next_click );

     $(".prev-month").unbind('click');
     $('.prev-month').live('click', prev_click );
    displayNotices();
  }

  var userPage = function(){
    return (typeof userMarks !== "undefined" && userMarks)
  };

var next_click = function() {
	old_year = year;
	next_month_and_year();
	if(year != old_year) {
	    reset_calendar_year();
            restore_marks();
	}
	current_position = (month) * shift_width;
        $('html,body').animate({ scrollLeft: current_position }, 500);
	if(typeof($("#calenders")[0].style['-webkit-transform'])!='undefined')
	{
	    //$("#calenders").css("-webkit-transform","translate(-"+current_position+"px"+",0px)");
            //window.animate({scrollTo: (current_position, 0)}, 1000);
	    //window.scrollTo(current_position, 0);
	} else {
	   //$("#calenders").css("left","-"+shift_width*2+"px");
	    //window.scrollTo(current_position, 0);
	}

	return false;
 };

var prev_click = function() {
  old_year = year;
  prev_month_and_year();
  if(year != old_year) {
    reset_calendar_year();
    restore_marks();
  }

  current_position = (month) * shift_width;
  $('html,body').animate({ scrollLeft: current_position }, 500);
  if(typeof($("#calenders")[0].style['-webkit-transform'])!='undefined') {
      //$("#calenders").css("-webkit-transform","translate(-"+current_position+"px"+",0px)");
      //window.scrollTo(current_position, 0);
  } else {
      //$("#calenders").css("left","0px");
      //window.scrollTo(current_position, 0);
  }
  return false;

};

 var update_next_and_previous = function() {
 };

  var update_links = function() {
    $(".date-item").unbind('click');
    $(".date-item").click( function(){
      console.log("clicked: "+$(this).attr('id'));
      if($(this).hasClass('xmarksthespot')) {
        $(this).toggleClass('xmarksthespot');
        marks_store.remove($(this).attr('id'), function() {});
        mark_count -= 1;
      } else {
        marks_store.save({key:$(this).attr('id'),val:true});
        $(this).toggleClass('xmarksthespot');
        mark_count += 1;
      }
      marks_store.save({key:'last_updated',val:new Date()}, function() {
        $("#total-marks").html(mark_count);
        streaks();
        sync();
      });
      return false;
    });

      update_next_and_previous();

      $("#clear-all").unbind('click');
      $('#clear-all').click( function() {

          var answer = confirm ("Are you sure you want to clear your data?")
	  if(answer) {
	      marks_store.nuke();
	      mark_count = 0;
	      $("#calendar").calendarWidget({
		  month: month,
		  year: year
	      });
	      restore_marks();
	      clear_and_display_notice("Local Marks cleared", 'notice');
	      return false;
	  } else {
              clear_and_display_notice("clear cancelled", 'notice');
	  }
      });

    //logout is created after the page starts, can't use click
    $('#logout').live('click', function() {
      marks_store.nuke();
      logged_in = false;
      mark_count = 0;
      $("#calendar").calendarWidget({
        month: month,
	      year: year
      });
      restore_marks();
	clear_and_display_notice("You are now logged out!", 'notice');
      return true;
    });

  }

  var reconnected = function() {
    auth();
  }

  var auth = function() {
    if (window.navigator.onLine) {
      console.log("check auth");
      $.get("/users/auth.json", function (data) {
	  console.log('auth resp');
	  console.log(data);
          var user = data['user'];
          if(user && user['email'] && user['id']) {
	    var template = "<span class='logged-in-info'>Logged in as <a href='/users/{{to_param}}'>{{email}}</a></span><br/><a href='/users/edit'>Edit Account</a> | Not you? <a id='logout' href='/users/sign_out'>Sign out</a>";
            logged_in = true;
	  } else {
	    var template = "<span id='get-login'><a href='/users/sign_in' id='sign-in-link' data-pjax='#main'>Sign In</a> or <a href='/users/sign_up' id='sign-up-link' data-pjax='#main'>Sign Up</a></span>";
            logged_in = false;
	  }
          $("#auth-state").html(Mustache.to_html(template, user));
        first_sync = true;
        sync();
      });
    } else {
      console.log("offline try auth later");
      $("#auth-state").html("<span class='offline-mode'>offline mode, syncing disabled</span>");
    }
  }

  var sync = function() {
    if (window.navigator.onLine) {
        if(logged_in==true) {
            console.log("start sync");
            sync_data = [];
            marks_store.all(function(items) { sync_data = items });
            console.log('sync data size: '+sync_data.length);
            sync_data = {'data':JSON.stringify(sync_data), 'first_sync':first_sync}
            console.log('sync data: '+sync_data['data']);
            $.post("/marks/sync", sync_data, function (data) {
		first_sync = false;
		console.log('choose update?: '+data['choose_update']);
                if(data['choose_update']) {
                    var answer = confirm ("Your local storage has more recent changes than the version on our server. Please choose to use local data (click 'ok') or update to the last saved server data (cancel). Keep local data?")
		    if(answer) {
			sync();
		     } else {
                         //destroy local data, reset calendar
			 marks_store.nuke();
                         $("#calendar").calendarWidget({
                           month: month,
	                   year: year
                         });
			 sync();
		     }
                }
                console.log('force local update?: '+data['force_update']);
                if(data['force_update']) {
	          marks_store.nuke();
		  restore_marks();
                  marks_data = data['data'];
                  if(marks_data!=null) {
	            $.each(marks_data, function(index, record) {
	              console.log('item: '+index+': '+record['key']+':'+record['val']);
	              marks_store.save({key:record['key'],val:record['val']});
	            });
                    restore_marks();
		  }
                }
            });
        } else {
          console.log("not logged in no syncing");
            clear_and_display_notice("No syncing occurs unless logged in", 'notice');
        }
    } else {
      console.log("offline try later");
      clear_and_display_notice("No syncing occurs during offline mode", 'error');
    }
  }

  var clear_and_display_notice = function(message, type) {
    clearNotices();
    displayNotice(message, type)
  }

  var displayNotice = function(message, type) {
    $("#messages ."+type).html(message);
    $("#messages").slideDown();
    setTimeout("$('#messages').slideUp();", 15000)
  }

  var notices = ['notice', 'alert', 'error'];

  var clearNotices = function() {
    $.each(notices, function(index, type) {
      $("#messages ."+type).html("");
    });
  }

  var displayNotices = function() {
      clearNotices();
      $.each(notices, function(index, type) {
          if(cookieGet(type)) {
              var msg = unescape(cookieGet(type)).replace(/[+]/g," ");
              displayNotice(msg, type);
              writeCookie(type,'');
          }
      });
  }

  var cookieGet = function(cookie_name) {
      if (document.cookie) {
	  index = document.cookie.indexOf(cookie_name);
	  if (index != -1) {
	      namestart = (document.cookie.indexOf("=", index) + 1);
	      nameend = document.cookie.indexOf(";", index);
	      if (nameend == -1) {
		  nameend = document.cookie.length;
	      }
	      cookieVal = document.cookie.substring(namestart, nameend);
	      return cookieVal;
	  }
      }
  }

  var writeCookie = function(key, value) {
      document.cookie = key+'='+value+'; path=/;';
  }

  var upgradeMarks = function() {
      var oldDateFormat = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/
      var needs_update = [];
      marks_store.all(function(items) {
          items.forEach(function(item) {
              if(item.key!="last_updated") {
                  if(oldDateFormat.test(item.key)) {
                      needs_update.push(item);
      		  }
              }
          });
      });

      $.each(needs_update, function(index, item) {
      	  var convertedDate = new Date(item.key);
          convertedDate = dateFormatted(convertedDate);
          console.log('update cached-mark old: '+item.key+' new: '+convertedDate);
      	  marks_store.remove(item.key, function() {});
          marks_store.save({key:convertedDate,val:true});
      });
  }

  //this shares to much with restore_marks make more of the same
  var restoreUserMarks = function() {
    update_next_and_previous();
    mark_count = 0;
    var data = userMarks.data
    if(data) {
    $.each(data, function(index, item) {
        if(item.key!="last_updated") {
	  mark_count += 1;
          console.log('cached-mark: '+item.key);
          $("."+item.key.replace(/ /g,'.')).addClass('xmarksthespot');
        } else {
          console.log('last updated: '+item.key+' : '+item.val);
        }
      });
    }
    $("#total-marks").html(mark_count);
    streaks();
  }

  var restore_marks = function() {
    if(userPage()) {
	restoreUserMarks();
    } else {
      update_links();
      mark_count = 0;
      marks_store.all(function(items) {
        items.forEach(function(item) {
          if(item.key!="last_updated") {
	    mark_count += 1;
            console.log('cached-mark: '+item.key);
            $("."+item.key.replace(/ /g,'.')).addClass('xmarksthespot');
          } else {
            console.log('last updated: '+item.key+' : '+item.val);
          }
        });
      });
      $("#total-marks").html(mark_count);
      streaks();
    }
  }

  var dateFormatted = function(d) {
    var curr_date  = zeroPad(d.getDate(),2);
    var curr_month = zeroPad(d.getMonth() + 1,2); //months are zero based
    var curr_year  = zeroPad(d.getFullYear(),2);
    return (curr_year + "-" + curr_month + "-" + curr_date);
  }

  var zeroPad = function (num,count) {
    var numZeropad = num + '';
    while(numZeropad.length < count) {
      numZeropad = "0" + numZeropad;
    }
    return numZeropad;
  }

  //todo refactor this
  var streaks = function() {
    longest_streak = 0;
    var streak_count = 0;
    var current_streak = [];
    var current_streak_count = 0;
    var today = new Date();
    var yesterday = new Date();
    var swap_item = null;
    yesterday.setDate(yesterday.getDate() - 1);

    var loopIteration = function(record, index) {
        if(typeof record.key==='undefined') {
	  // Seriously jquery loop and lawnchair loop function
          // have record and index in opposite fields
	  // TODO find a better way to swap or make more explicit with mehtod call
	  swap_item = index
	  index = record
	  record = swap_item
	}

        if(record.key!='last_updated') {

        if(current_streak.length==0) {
          //console.log('first: '+record.key);
          current_streak.push(record.key)
          streak_count = current_streak.length;
          if(streak_count > longest_streak) {
            longest_streak = streak_count;
          }

        } else if(current_streak.length>0) {
          //console.log('more than one');
          var tomorrow = new Date();
          var parts = current_streak[current_streak.length-1].split('-');
          tomorrow.setFullYear(parts[0], parts[1]-1, parts[2]); // year, month (0-based), day
          tomorrow.setTime(tomorrow.getTime() + 86400000);
          //console.log('tomorrow: '+dateFormatted(tomorrow));
          //console.log('matching: '+record.key);
          if(dateFormatted(tomorrow)==record.key) {
            //console.log('hit single');
            current_streak.push(record.key);
            streak_count = current_streak.length;
            if(streak_count > longest_streak) {
              longest_streak = streak_count;
            }
          } else {
            //update current streak
            $.each(current_streak, function(index, value) {
              //console.log('today:'+dateFormatted(today));
              //console.log('match:'+value);
              if(dateFormatted(today)==value) {
                current_streak_count = current_streak.length;
              }
            });

            current_streak = [];
            current_streak.push(record.key)
            if(dateFormatted(today)==record.key || dateFormatted(yesterday)==record.key) {
              current_streak_count = current_streak.length;
            }
          }

        }
      }
    };

   if(userPage()) {
      var data = userMarks.data
      console.log('data: ' + data);
      if(typeof data !== "undefined" && data) {
        $.each(data, loopIteration);
      }
    } else {
    marks_store.where('record.val==true').asc('key', function(){
      this.each( loopIteration );
      });
    }

    //update current streak, which didn't hit the next streak case
    $.each(current_streak, function(index, value) {
      //console.log('today:'+dateFormatted(today));
      //console.log('match:'+value);
      if(dateFormatted(today)==value || dateFormatted(yesterday)==value) {
        current_streak_count = current_streak.length;
      }
    });

    $("#longest-streak").html(longest_streak);
    $("#current-streak").html(current_streak_count);
  }

/*begin new animation functions these should all be in a closure*/

var flipAnimationSpeed = function() {
  $("#calenders").toggleClass('fast');
};

var next_month_and_year = function(){
 month = month + 1;
 if(month >= 12) {
  year = year + 1;
  month = 0;
 }
};

var prev_month_and_year = function(){
  month = month - 1;
  if(month < 0) {
    year = year - 1;
    month = 11;
  }
};

var reset_calendar_year = function(){
  var original_year = year;
  var original_month = month;
  month = 0;
  n = 0;
  do {
    $("#calendar-"+n).calendarWidget({
      month: month,
      year: year
    });
    next_month_and_year();
    ++n;
  } while (n<12)
  year = original_year;
  month = original_month;
}

var scroll_end = function(){
  widths = Math.round(window.scrollX / shift_width);
  current_position = widths * shift_width;
  $('html,body').animate({ scrollLeft: current_position }, 100);
}

current_date = new Date();
var shift_width = document.documentElement.clientWidth; //screen.width;
/*
  all 12 months are there but only prev, current, and next populate
  animate between the 12 cubes redrwaring only prev, current, and next
  if they pass a year animate quickly all the way over and redraw...
  starting animation should also be like 0.1 opposed to full second.
  all done except the only drawing 3 of the calendars
*/
var animatedCalendars = function() {
  //window.onscroll=scroll_end;
  $(window).bind('scrollstop', scroll_end);

  setTimeout('flipAnimationSpeed()', 400)

//build calender collection
var n = 0;
var new_cal = $("<span class='calendar'><p></p></span>");
do {
  new_cal = $("<span class='calendar'><p></p></span>");
  new_cal.attr("id","calendar-"+n);
  $("#calenders").append(new_cal);
  ++n;
} while (n<12)

month = 0;
year = current_date.getYear()+1900;
reset_calendar_year();

//reset month to now
month = current_date.getMonth();
var current_position = (month) * shift_width;
$("#calenders .calendar table").css("width", shift_width);
$("#calenders .calendar").css("width", shift_width);

//center calendar on current month
// $("#calenders").css("-webkit-transform","translate(-"+current_position+"px"+",0px)");
//window.scrollTo(current_position, 0);
 $('html,body').animate({ scrollLeft: current_position }, 500);

}