(function(){
  
  window.surge = Surge();

	$(document).on('click', '#test', function(event) {
		event.preventDefault();
		/* Act on the event */

		surge.emit('channel1','test','ping');

	});
	$(document).on('click', '#test2', function(event) {
  	event.preventDefault();
  	/* Act on the event */

  	var channel = surge.subscribe('channel1');
  });
  $(document).on('submit', '#joinRoomForm', function(event) {
  	event.preventDefault();
  	/* Act on the event */
  	var room = $(this).find('input').val();
  	var channel = surge.subscribe(room);
  });
   $(document).on('submit', '#leaveRoomForm', function(event) {
  	event.preventDefault();
  	/* Act on the event */
  	var room = $(this).find('input').val();
  	surge.unsubscribe(room);
  	
  });
	$(document).on('click', '#test3', function(event) {
  	event.preventDefault();
  	/* Act on the event */
  	var x = surge.connection.rooms;
  	alert("You are in rooms : "+x);
  	
  });
  $(document).on('submit', '#emitChannel', function(event) {
    event.preventDefault();
    /* Act on the event */

    surge.emit($('#i2').val(),$('#i1').val(),$('#i3').val());

  });

  surge.connection.watch('state',function(id, oldval, newval){
  	$('#state').html(newval);
    return newval;
  });

	surge.on('surge-joined-room', function() {
		$('#rooms').html('');
		for (var i = 0; i < surge.connection.rooms.length; i++) {
			$('#rooms').append(' '+surge.connection.rooms[i])
		};
	});
	surge.on('surge-left-room', function() {
		$('#rooms').html('');
		for (var i = 0; i < surge.connection.rooms.length; i++) {
			$('#rooms').append(' '+surge.connection.rooms[i])
		};
	});

})()