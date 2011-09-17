  //setup offline storage
  var marks_store = new Lawnchair({name:'marks', adaptor:'dom indexed-db webkit-sqlite window-name'}, function(marks) {});
  var mark_count = 0;
  var longest_streak = 0;
  
  $(function(){
    //display calendar
    $("#calendar").calendarWidget({});

    setTimeout(function() { window.scrollTo(0, 1) }, 1000);
    restore_marks();
    jQuery.ajaxSetup({
	'beforeSend': function(xhr) {
	  xhr.setRequestHeader("Accept", "text/javascript")
	    }
      });
    sync();
  });

  var update_links = function() {
    $(".date-item").click( function(){
      if($(this).hasClass('xmarksthespot')) {
        $(this).toggleClass('xmarksthespot');
        marks_store.remove($(this).attr('id'), function() {});
        mark_count -= 1;
      } else {
        marks_store.save({key:$(this).attr('id'),val:true});
        $(this).toggleClass('xmarksthespot');
        mark_count += 1;
      }
      marks_store.save({key:'last_updated',val:new Date()});
      $("#total-marks").html(mark_count);
      streaks();
      sync();
      return false;
    });
  }

  var sync = function() {
    console.log("start sync");
    sync_data = [];
    marks_store.all(function(items) { sync_data = items });
    sync_data = {'data':JSON.stringify(sync_data)}
    console.log(sync_data);
    $.post("/marks/sync", sync_data, function (data) {
      console.log('results: '+data['force_update']);
      if(data['force_update']) {
	 marks_store.nuke();
	 restore_marks();
         marks_data = data['data'];
	 $.each(marks_data, function(index, record) {
	     console.log('item: '+index+': '+record['key']+':'+record['val']);
	     marks_store.save({key:record['key'],val:record['val']});
	     restore_marks();
	     //var pendingItems = $.parseJSON(localStorage["pendingItems"]);  
	     //pendingItems.shift();  
	     //localStorage["pendingItems"] = JSON.stringify(pendingItems);  
	     //setTimeout(sendPending, 100);
	   });
      }
    });  
  }

  var restore_marks = function() {
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
  
    marks_store.where('record.val==true').asc('key', function(){
      this.each(function(record, index) {
        //console.log('current: '+record.key);
  
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

      })
    });

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

  $('#clear-all').click( function() {
    marks_store.nuke();
    mark_count = 0;
    $("#calendar").calendarWidget({
        month: month,
	year: year
    });
    restore_marks();
    return false;
  });