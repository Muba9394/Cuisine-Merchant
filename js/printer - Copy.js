  var bt ='';  
 var device_type ='';
    
  var bluetooth = function ($q, $window) { 
  if(getStorage("device_platform"))
  device_type = getStorage("device_platform");
    var _this = this;
    var serviceUUID = "49535343-FE7D-4AE5-8FA9-9FAFD205E455";// IOS ONLY
    var writeCharacteristic = "49535343-8841-43F4-A8D4-ECBE34729BB3"; //IOS ONLY
    var readCharacteristic = "49535343-1E4D-4BD9-BA61-23C647249616"; //IOS ONLY
    this.isEnabled = function () {  
      var d = '';
      function successCallback(success) {
        d = true;
      }
      function errorCallback(error) {
        d = false;
      } 
	  if(device_type == "Android") bluetoothSerial.isEnabled(successCallback, errorCallback);
	  if(device_type == "Ios") ble.isEnabled(successCallback, errorCallback);
      /*if (ionic.Platform.isIOS()) {
        ble.isEnabled(successCallback, errorCallback);
      } else if (ionic.Platform.isAndroid()) { 
        bluetoothSerial.isEnabled(successCallback, errorCallback);
      }*/
	  
      return d;
    }
    this.enable = function () { 
      var d = '';
	  
      if (ionic.Platform.isIOS()) {
        d = "not support";
      } else if (ionic.Platform.isAndroid()) {
        bluetoothSerial.enable(function (success) {
          d = success;
        }, function (error) {
          d = error;
        })
      }
      return d;
    }
    this.startScan = function () { 
		var html = ''; 
      var d = new Array;
      if (ionic.Platform.isIOS()) {
        ble.startScan([], function (device) {
          d = device;
        }, function (error) {
          d =error;
        });
      } else if (ionic.Platform.isAndroid()) { 
        bluetoothSerial.setDeviceDiscoveredListener(function (device) { 
          d.push(device);
		  html += '<li onclick="conDevice(\''+device.id+'\');" style="padding:10px;">'+device.name+'</li>';
		 setStorage("device_list",html);
        }); 
        bluetoothSerial.discoverUnpaired(function (devices) {
          d.push(devices);
		  //$("#con_devices").append('<ons-list-item modifier="tappable" onclick="conDevive('+devices.id+');">'+devices.name+'</ons-list-item>');
        }, function (error) {
          d = error;
        });
      }
  
	//  alert(getStorage('device_list'));
	  
      return d;
    }
    this.stopScan = function () {
      var d = $q.defer();
      if (ionic.Platform.isIOS()) {
        $window.ble.stopScan(function (success) {
          d.resolve(success);
        }, function (error) {
          d.reject(error);
        })
      }
      return d.promise;
    }
    this.isConnected = function (deviceId) {
      var d = $q.defer();
      function successCallback(success) {
        d.resolve(true);
      }
      function errorCallback(error) {
        d.resolve(false);
      }
      if (ionic.Platform.isIOS()) {
        ble.isConnected(deviceId, successCallback, errorCallback);
      } else if (ionic.Platform.isAndroid()) {
        bluetoothSerial.isConnected(successCallback, errorCallback);
      }
      return d.promise;
    }
    this.connect = function (deviceId) {
      var d = '';
      function successCallback(success) { 
        console.log("connected");
      }
      function errorCallback(error) {
         console.log("disconnected");
      }
      if (ionic.Platform.isIOS()) {
        ble.stopScan(null, null);
        ble.connect(deviceId, function (deviceInfo) {
          for (var index = 0; index < deviceInfo.services.length; index++) {
            var service = deviceInfo.services[index];
            if (service == serviceUUID) {
              
              ble.startNotification(deviceId, serviceUUID, readCharacteristic, null, null);
              return;
            }
          }
        }, errorCallback);
      } else {
        // without bond
        bluetoothSerial.connectInsecure(deviceId, successCallback, errorCallback);
      }
      return d;
    }
    this.disconnect = function (deviceId) {
      var d = $q.defer();
      function successCallback(success) {
        d.resolve(success);
      }
      function errorCallback(error) {
        d.reject(error);
      }
      if (ionic.Platform.isIOS()) {
        $window.ble(deviceId, successCallback, errorCallback);
      } else if (ionic.Platform.isAndroid()) {
        $window.bluetoothSerial.disconnect(successCallback, errorCallback);
      }
      return d.promise;
    }
    this.write = function (buffer, deviceId) {
      var d = '';
      function successCallback(success) {
         console.log(success);
      }
      function errorCallback(error) {
         console.log(error);
      }
      if (ionic.Platform.isIOS()) {
        ble.write(deviceId, serviceUUID, writeCharacteristic, buffer, successCallback, errorCallback);
      } else if (ionic.Platform.isAndroid()) {
        bluetoothSerial.write(buffer, successCallback, errorCallback);
      }
      return d;
    }
  };
  
  
	 
	 var _EscCommand = (function () {
    function _EscCommand() {
        this.ESC = "\u001B";
        this.GS = "\u001D";
        this.InitializePrinter = this.ESC + "@";
		this.UKCharSet = this.ESC + "R" + "\3"; //ESC R 3 for UK Char Set
        this.BoldOn = this.ESC + "E" + "\u0001";
        this.BoldOff = this.ESC + "E" + "\0";
        this.DoubleHeight = this.GS + "!" + "\u0001";
        this.DoubleWidth = this.GS + "!" + "\u0010";
        this.DoubleOn = this.GS + "!" + "\u0011"; // 2x sized text (double-high + double-wide)
        this.DoubleOff = this.GS + "!" + "\0";
        this.PrintAndFeedMaxLine = this.ESC + "J" + "\u00FF"; // 打印并走纸 最大255
        this.TextAlignLeft = this.ESC + "a" + "0";
        this.TextAlignCenter = this.ESC + "a" + "1";
        this.TextAlignRight = this.ESC + "a" + "2";
    }
    _EscCommand.prototype.PrintAndFeedLine = function (verticalUnit) {
        if (verticalUnit > 255)
            verticalUnit = 255;
        if (verticalUnit < 0)
            verticalUnit = 0;
        return this.ESC + "J" + String.fromCharCode(verticalUnit);
    };
    _EscCommand.prototype.CutAndFeedLine = function (verticalUnit) {
        if (verticalUnit === void 0) {
            return this.ESC + "v" + 1;
        }
        if (verticalUnit > 255)
            verticalUnit = 255;
        if (verticalUnit < 0)
            verticalUnit = 0;
        return this.GS + "V" + String.fromCharCode(verticalUnit);
    };
    return _EscCommand;
} ());

$(document).ready(function(e) {
	
    function print(content) { 
      var uint8array = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
      bt.write(uint8array.buffer, 'E4:7F:B2:6A:E4:61');
    }



  bt = new bluetooth(0);
  if(!bt.isEnabled()){ 
	  bt.enable();
  }
 /* 
 bt.startScan();
  bt.isEnabled()
      .then(function (isEnabled) {
        if (!isEnabled) {
          bt.enable();
        }
      });
	  bluetoothDevices = new Array();
	 bt.connect('E4:7F:B2:6A:E4:61');

var Esc = new _EscCommand();*/

setTimeout(function(){

//bt.startScan();
	/*$('#popupdevice ul').append(getStorage('device_list'));
	$('#popupdevice, #popupdevice ons-dialog').show();*/
	},15000);
	
	

});

function conDevice(deviceId){ 
	
	var bt = new bluetooth(0); 
	if(!bt.isEnabled()){
	  bt.enable(); }
	   
	var chk = bt.connect(deviceId); $('#popupdevice ons-dialog').hide();
	var Esc = new _EscCommand();
	
					
	var print_cnt = res_copy=kit_copy='';
	for(var i=0;i<$("#order-details-item").children().length;i++){
		//alert($("#order-details-item").children().eq(i).html());
		if($("#order-details-item").children().eq(i).hasClass('header')) {
			if(i == ($("#order-details-item").children().length-1)) print_cnt += "------- ------------------------- --------\n";
			print_cnt += Esc.DoubleWidth + $("#order-details-item").children().eq(i).find('.ons-col-inner').html();
			if(typeof $("#order-details-item").children().eq(i).find('.text-right').html() != "undefined") {
				print_cnt += "      "+Esc.UKCharSet +Esc.DoubleWidth + $("#order-details-item").children().eq(i).find('.text-right').html().substr(1);
			}
			print_cnt += Esc.DoubleOff+"\n";
			if(i == 0) print_cnt += "\n";
		}
		
		if($("#order-details-item").children().eq(i).hasClass('list__item')) { 
			if($("#order-details-item").children().eq(i).find('.row ons-col').hasClass('fixed-col')){
				var str = $("#order-details-item").children().eq(i).find('.row .fixed-col').html();
				result = str.replace(/.{20}\S*\s+/g, "$&@").split(/\s+@/);
				/*var chr = $("#order-details-item").children().eq(i).find('.row .undefined').html().length;
			var tol_space = '';
			for(var j=0;j<(30-result.join("\n").length);j++){
				tol_space +=space;
			}*/var tol_space = '';
				//alert(result.join("\n")); 
				//alert($("#order-details-item").children().eq(i).find('.row .text-right').html().substr(1));
			print_cnt += Esc.TextAlignLeft +result.join("\n")+tol_space+"      "+Esc.UKCharSet + Esc.TextAlignRight + $("#order-details-item").children().eq(i).find('.row .text-right').html().substr(1)+"\n";
			kit_copy += Esc.DoubleWidth +$("#order-details-item").children().eq(i).find('.row .fixed-col').html() +"\n";
			}
			
			if($("#order-details-item").children().eq(i).find('.row ons-col').hasClass('undefined')){ 
			var space = " ";
			var chr = $("#order-details-item").children().eq(i).find('.row .undefined').html().length;
			var tol_space = '';
			for(var j=0;j<(10-$("#order-details-item").children().eq(i).find('.row .undefined').html().length);j++){
				tol_space +=space;
			}
			print_cnt += Esc.TextAlignLeft +$("#order-details-item").children().eq(i).find('.row .undefined').html()+tol_space+"              "+Esc.UKCharSet + Esc.TextAlignRight + $("#order-details-item").children().eq(i).find('.row .text-right').html().substr(1)+"\n";
			}
		}
		
	}		
	
	for(var i=0;i<$("#order-details").children().length;i++){
		if($("#order-details").children().eq(i).hasClass('header')) {
			res_copy += Esc.TextAlignCenter + $("#order-details").children().eq(i).find('.text-right').html()+"\n";
			res_copy += Esc.TextAlignCenter + "Order Type : "+ $("#order-details").children().eq(4).find('.row .text-right').html()+"\n";
			res_copy += "------- ------------------------- --------\n";
			res_copy += Esc.TextAlignLeft +"Date   "+"              " + Esc.TextAlignRight + $("#order-details").children().eq(6).find('.text-right').text()+"\n";
			res_copy += Esc.TextAlignLeft +"Time   "+"              " + Esc.TextAlignRight + $("#order-details").children().eq(7).find('.text-right').text()+"\n";
		}
		
		if($("#order-details").children().eq(i).hasClass('list__item')) {
			if(i ==1) 
			res_copy += Esc.TextAlignLeft +"Name   "+"             " + Esc.TextAlignRight + $("#order-details").children().eq(i).text()+"\n";
			if(i ==2) 
			res_copy += Esc.TextAlignLeft +"Phone  "+"             " + Esc.TextAlignRight + $("#order-details").children().eq(i).text()+"\n";
			if(i ==3) 
			res_copy += Esc.TextAlignLeft +"Address \n"+ "    " + $("#order-details").children().eq(i).find('.fixed-col').text()+"\n";
		}
	}
	if($("#order-details").children().eq(5).find('.row .text-right').html() == "COD"){
		res_copy_pay = Esc.DoubleOn + "  CASH ON DELIVERY!\n" + Esc.DoubleOff;
	}else{
		res_copy_pay = Esc.DoubleOn + "  Online!\n" + Esc.DoubleOff;
	}
	
	var print_dtl = Esc.InitializePrinter+"            "+Esc.DoubleOn+"Cuisine.je\n\n" + Esc.DoubleOff + print_cnt +"\n\n\n\n"+Esc.PrintAndFeedMaxLine + Esc.CutAndFeedLine();		
	print_dtl += Esc.InitializePrinter+Esc.DoubleOn+"  RESTAURANT COPY\n\n" + Esc.DoubleOff + res_copy+"\n------- ------------------------- --------\n"+print_cnt+"\n------- ------------------------- --------\n"+res_copy_pay +"\n\n\n\n"+Esc.PrintAndFeedMaxLine + Esc.CutAndFeedLine();	
	
	var kit_dtl = Esc.TextAlignCenter + $("#order-details").children().eq(0).find('.text-right').html()+"\n"+Esc.TextAlignLeft +"Name   "+"              " + Esc.TextAlignRight + $("#order-details").children().eq(1).text()+"\n------- ------------------------- --------\n";
	
	print_dtl += Esc.InitializePrinter+Esc.DoubleOn+"   kitchen COPY\n\n" + Esc.DoubleOff +kit_dtl + kit_copy +"\n\n\n\n"+Esc.PrintAndFeedMaxLine + Esc.CutAndFeedLine();		
	setTimeout(function(){ 
		 var uint8array = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(print_dtl);
      bt.write(uint8array.buffer, deviceId);
	},4000);
}

function printorder(){ 
	var Esc = new _EscCommand();
	var escCommand = Esc.InitializePrinter +
        Esc.TextAlignRight + "HelloWorld!\n" +
        Esc.TextAlignCenter + "HelloWorld!\n" +
        Esc.TextAlignLeft + "HelloWorld!\n" +
        Esc.BoldOn + "Deepa Ryan!\n" + Esc.BoldOff +
        Esc.DoubleHeight + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.DoubleWidth + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.DoubleOn + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.PrintAndFeedMaxLine + Esc.CutAndFeedLine(); 
		//alert($("#order-details-item").find('ons-list-header:eq(2) .row .text-right').html());
	//alert($("#order-details-item").find('ons-list-item:eq(0) .row .fixed-col').html());	
    var print_dtl = Esc.InitializePrinter+"            "+Esc.DoubleOn+"Cuisine.je\n\n" + Esc.DoubleOff + Esc.DoubleWidth + "Order Details\n\n"+ Esc.DoubleOff +	Esc.TextAlignLeft +$("#order-details-item").find('ons-list-item:eq(0) .row .fixed-col').html()+"         " + Esc.TextAlignRight + $("#order-details-item").find('ons-list-item:eq(0) .row .text-right').html()+"\n"+
					Esc.TextAlignLeft + $("#order-details-item").find('ons-list-item:eq(1) .row .undefined').html()+"                       " + Esc.TextAlignRight + $("#order-details-item").find('ons-list-item:eq(1) .row .text-right').html()+"\n"+
					Esc.TextAlignLeft + $("#order-details-item").find('ons-list-item:eq(2) .row .undefined').html()+"                     " + Esc.TextAlignRight + $("#order-details-item").find('ons-list-item:eq(2) .row .text-right').html()+"\n"+
					Esc.TextAlignLeft + $("#order-details-item").find('ons-list-item:eq(3) .row .undefined').html()+"                       " + Esc.TextAlignRight + $("#order-details-item").find('ons-list-item:eq(3) .row .text-right').html()+"\n"+
					Esc.TextAlignLeft + $("#order-details-item").find('ons-list-item:eq(4) .row .undefined').html()+"                        " + Esc.TextAlignRight + $("#order-details-item").find('ons-list-item:eq(4) .row .text-right').html()+"\n\n"+Esc.DoubleWidth+$("#order-details-item").find('ons-list-header:eq(2) .row ons-col:first-child').html()+"      "+$("#order-details-item").find('ons-list-header:eq(2) .row .text-right').html()+"\n\n\n\n\n\n"+Esc.PrintAndFeedMaxLine + Esc.CutAndFeedLine();
	
   print(print_dtl);
   
  // bt.write($("#order-details-item").html(), 'E4:7F:B2:6A:E4:61');
	 
}

  function print(content) { 
 	  var bt = new bluetooth(0);
	 var chk =  bt.connect('E4:7F:B2:6A:E4:61');
	 if(chk){
      var uint8array = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
      bt.write(uint8array.buffer, 'E4:7F:B2:6A:E4:61');
	 }
    }