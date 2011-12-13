  //setup offline storage
  var marks_store = new Lawnchair({name:'marks', adaptor:'dom indexed-db window-name'}, function(marks) {});
  var mark_count = 0;
  var longest_streak = 0;
  var logged_in = false;
  var first_sync = false;

  jQuery.fn.exists = function(){return this.length>0;}

  //pjax start and end functions
  $('#main')
    .bind('pjax:start', function() { $('#loading').show() })
    .bind('pjax:end',   function() {
	$('#loading').hide();
	var sub_title = $('.data-title').html();
	$('.subtitle').html(sub_title);
	window.scrollTo(0, 1);
        startup();
    });

  $(function(){
      setTimeout(function() {
        window.scrollTo(0, 1);
      }, 1000);
      startup();
      $('a[data-pjax]').pjax();
  });

  var startup = function(){
    //display calendar

    $("#calendar").calendarWidget({});

    $('form:first *:input[type!=hidden]:first').focus();
    if($('#calendar').exists()) {
      if(userPage()) {
        restoreUserMarks();
      } else {
        auth();
        restore_marks();
        //if we reconnect to the net sync again
        $(window).bind("online", reconnected);
      }
    }
    displayNotices();
  }

  var userPage = function(){
    return (typeof userMarks !== "undefined" && userMarks)
  };

 var update_next_and_previous = function() {
    $("#next-month").unbind('click');
    $('#next-month').click( function() {
      var next_month = month + 1;
      if(next_month >= 12) {
        year = year + 1;
        next_month = 0;
      }
      $("#calendar").calendarWidget({
        month: next_month,
	year: year
      });
      restore_marks();
      return false;
    });

    $("#prev-month").unbind('click');
    $('#prev-month').click( function() {
      var prev_month = month - 1;
      if(prev_month < 0) {
        year = year - 1;
        prev_month = 11;
      }
      $("#calendar").calendarWidget({
        month: prev_month,
	year: year
      });
      restore_marks();
      return false;
    });
}

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

  //TODO to much shared with restore_marks, make more of the same
  var restoreUserMarks = function() {
    update_next_and_previous();
    mark_count = 0;
    var data = userMarks.data
    $.each(data, function(index, item) {
        if(item.key!="last_updated") {
	  mark_count += 1;
          console.log('cached-mark: '+item.key);
          $("#"+item.key.replace(/ /g,'.')).addClass('xmarksthespot');
        } else {
          console.log('last updated: '+item.key+' : '+item.val);
        }
      });
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
            $("#"+item.key.replace(/ /g,'.')).addClass('xmarksthespot');
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
    return (curr_month + "-" + curr_date + "-" + curr_year);
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
    yesterday.setDate(yesterday.getDate() - 1);

    var loopIteration = function(record, index) {
        if(typeof record.key==='undefined') {
	  // Seriously jquery loop and lawnchair loop function
          // have record and index in opposite fields
	  // TODO find a better way to swap or make more explicit with mehtod call
	  item = index
	  index = record
	  record = item
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
          tomorrow.setFullYear(parts[2], parts[0]-1, parts[1]); // year, month (0-based), day
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
      console.log('data: '+data);
      $.each(data, loopIteration);
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
