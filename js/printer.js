  var bt ='';


  var bluetooth = function ($q, $window) { 
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
      if (getStorage("device_platform") == "IOS") {
        ble.isEnabled(successCallback, errorCallback);
      } else if (getStorage("device_platform") == "Android") { 
        bluetoothSerial.isEnabled(successCallback, errorCallback);
      }

      return d;
    }
    this.enable = function () { 
      var d = '';
      if (getStorage("device_platform") == "IOS") {
        d = "not support";
      } else if (getStorage("device_platform") == "Android") { 
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
      if (getStorage("device_platform") == "IOS") {
        ble.startScan([], function (device) {
          d = device;
        }, function (error) {
          d =error;
        });
      } else if (getStorage("device_platform") == "Android") {
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
      if (getStorage("device_platform") == "IOS") {
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
      if (getStorage("device_platform") == "IOS") {
        ble.isConnected(deviceId, successCallback, errorCallback);
      } else if (getStorage("device_platform") == "Android") {
        bluetoothSerial.isConnected(successCallback, errorCallback);
      }
      return d.promise;
    }
    this.connect = function (deviceId) {
      var d = '';
      function successCallback(success) {
      //  alert("connected");
      }
      function errorCallback(error) {
      //  alert("disconnected");
      }
      if (getStorage("device_platform") == "IOS") {
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
      if (getStorage("device_platform") == "IOS") {
        $window.ble(deviceId, successCallback, errorCallback);
      } else if (getStorage("device_platform") == "Android") {
        $window.bluetoothSerial.disconnect(successCallback, errorCallback);
      }
      return d.promise;
    }
    this.write = function (buffer, deviceId,rl) {
      var d = '';
      function successCallback(success) {
      //  alert(success);	
      }
      function errorCallback(error) {
        //alert(error);
      }
      if (getStorage("device_platform") == "IOS") {
        ble.write(deviceId, serviceUUID, writeCharacteristic, buffer, successCallback, errorCallback);
      } else if (getStorage("device_platform") == "Android") {
        bluetoothSerial.write(buffer, successCallback, errorCallback);
      }
      return d;
    }
  };



	 var _EscCommand = (function () {
    function _EscCommand() {
        this.ESC = "\u001B";
        this.GS = "\u001D";
        this.LF = "\u000A";
        this.InitializePrinter = this.ESC + "@";
        this.UKCharSet = this.ESC + "R" + "\3"; //ESC R 3 for UK Char Set
        this.BoldOn = this.ESC + "E" + "\u0001";
        this.BoldOff = this.ESC + "E" + "\0";
        this.DoubleHeight = this.GS + "!" + "\u0001";
        this.DoubleWidth = this.GS + "!" + "\u0010";
        this.DoubleOn = this.GS + "!" + "\u0011"; // 2x sized text (double-high + double-wide)
        this.DoubleOff = this.GS + "!" + "\0";
        this.PrintAndFeedMaxLine = this.ESC + "J" + "\u00FF"; //
        this.TextAlignLeft = this.ESC + "a" + "0";
        this.TextAlignCenter = this.ESC + "a" + "1";
        this.TextAlignRight = this.ESC + "a" + "2";
        this.PartialCutPaper = this.GS+"V"+"1";
        this.FullCutPaper =  this.GS+"V"+"0";

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
            return this.GS + "V" + "1";
        }
        if (verticalUnit > 255)
            verticalUnit = 255;
        if (verticalUnit < 0)
            verticalUnit = 0;
        return this.GS + "V" + String.fromCharCode(verticalUnit);
    };
    return _EscCommand;
} ());


document.addEventListener("deviceready", function(){
	bt = new bluetooth(0);
  if(!bt.isEnabled()){
	  bt.enable();
  }

bt.startScan();
   
var Esc = new _EscCommand();

}, false);

$(document).ready(function(e) {
/*
    function print(content) {
      var uint8array = new TextEncoder('utf-8', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
      bt.write(uint8array.buffer, 'E4:7F:B2:6A:E4:56');
    }

*/

  /*bt = new bluetooth(0);
  if(!bt.isEnabled()){
	  bt.enable();
  }

bt.startScan();
   
var Esc = new _EscCommand();*/


});

function conDevice(deviceId){

	var bt = new bluetooth(0);
	if(!bt.isEnabled()){
	  bt.enable(); }
	if(!getStorage("bt_con_dev")){
		var chk = bt.connect(deviceId); $('#popupdevice ons-dialog').hide();
		setStorage("bt_con_dev",deviceId);
	}
	var Esc = new _EscCommand();

	var pound = '\u0023'; //Hexadecimal code for printing £

	var print_cnt = res_copy=kit_copy='';
	for(var i=0;i<$("#order-details-item").children().length;i++){
		//alert($("#order-details-item").children().eq(i).html());
		if($("#order-details-item").children().eq(i).hasClass('header')) {
			if(i == ($("#order-details-item").children().length-1)) print_cnt += "------- ----------------------- --------\n";
			print_cnt += Esc.DoubleWidth + $("#order-details-item").children().eq(i).find('.ons-col-inner').html();
			if(typeof $("#order-details-item").children().eq(i).find('.text-right').html() != "undefined") {
				print_cnt += "        "+Esc.DoubleWidth+Esc.UKCharSet+pound+$("#order-details-item").children().eq(i).find('.text-right').html().substr(1);
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
			}*/
			var tol_space = 32 -(result.join("\n").length);
			var empty_space = ' ', tol_spaces='';
			//alert(result.join("\n").length);
			if(result.join("\n").length >= 22){
					var newresult = str.replace(/.{20}\S*\s+/g, "$&@").split(/\s+@/);
					tol_space = 32 -$(newresult).last()[0].length;
			}
			
			for(var j=0;j<tol_space;j++){
				tol_spaces +=empty_space;
			}
				//alert(result.join("\n"));
				//alert($("#order-details-item").children().eq(i).find('.row .text-right').html().substr(1));
			print_cnt += Esc.TextAlignLeft +result.join("\n")+tol_spaces+ Esc.TextAlignRight  + Esc.UKCharSet+ pound + $("#order-details-item").children().eq(i).find('.row .text-right').html().substr(1)+"\n";

			var str= $("#order-details-item").children().eq(i).find('.row .fixed-col').html();
			str = str.split(' ');
			str[0] = str[0].replace("x",'');
			str.splice(1, 1);

			kit_copy += Esc.TextAlignLeft+Esc.DoubleWidth +str.join(" ") +Esc.DoubleOff +"\n\n";
			//kit_copy += Esc.TextAlignLeft+Esc.DoubleWidth +$("#order-details-item").children().eq(i).find('.row .fixed-col').html()+Esc.DoubleOff +"\n\n";
			}

			if($("#order-details-item").children().eq(i).find('.row ons-col').hasClass('undefined')){
			var space = " ";
			var chr = $("#order-details-item").children().eq(i).find('.row .undefined').html().length;

			var tol_space = 32 -($("#order-details-item").children().eq(i).find('.row .undefined').html().length);
			var empty_space = ' ', tol_spaces='';
			for(var j=0;j<tol_space;j++){
				tol_spaces +=empty_space;
			}
			print_cnt += Esc.TextAlignLeft +$("#order-details-item").children().eq(i).find('.row .undefined').html()+tol_spaces+ Esc.TextAlignRight  + Esc.UKCharSet+ pound + $("#order-details-item").children().eq(i).find('.row .text-right').html().substr(1)+"\n";
			}
		}

	}

	for(var i=0;i<$("#order-details").children().length;i++){
		if($("#order-details").children().eq(i).hasClass('header')) {
			res_copy += Esc.TextAlignCenter + Esc.DoubleOn + $("#order-details").children().eq(i).find('.text-right').html()+ Esc.DoubleOff +"\n";
			res_copy += Esc.TextAlignCenter + "Order Type : "+ $("#order-details").children().eq(4).find('.row .text-right').html()+"\n";
			res_copy += "------- ----------------------- --------\n";
			res_copy += Esc.TextAlignLeft +"Date   "+"              " + Esc.TextAlignRight + $("#order-details").children().eq(6).find('.text-right').text()+"\n";
			res_copy += Esc.TextAlignLeft +"Time   "+"              " + Esc.TextAlignRight + $("#order-details").children().eq(7).find('.text-right').text()+"\n";
		}

		if($("#order-details").children().eq(i).hasClass('list__item')) {
			if(i ==1)
			res_copy += Esc.TextAlignLeft +"Name   "+"             " + Esc.TextAlignRight + $("#order-details").children().eq(i).text()+"\n";
			if(i ==2)
			res_copy += Esc.TextAlignLeft +"Phone  "+"             " + Esc.TextAlignRight + $("#order-details").children().eq(i).text()+"\n";
			if(i ==3)
			res_copy += Esc.TextAlignLeft +"Deliver to -> \n"+ $("#order-details").children().eq(i).find('.fixed-col').text()+"\n";
		}
	}


	if($("#order-details").children().eq(5).find('.row .text-right').html() == "COD"){
		res_copy_pay = Esc.DoubleOn +Esc.TextAlignCenter+"CASH ON DELIVERY!\n" + Esc.DoubleOff;
	}else{
		res_copy_pay = Esc.DoubleOn +Esc.TextAlignCenter+ "  PAID\n" + Esc.DoubleOff;
	}


	var m_dtl = JSON.parse( getStorage("merchant_info") );

	var res_footer = "\nThank you for ordering with Cuisine.je\nFor enquiries on your order,please contact "+m_dtl.restaurant_name+".";

	var merchant_details = '------- ----------------------- --------\n'+Esc.TextAlignCenter + Esc.DoubleOn + m_dtl.restaurant_name+ Esc.DoubleOff +"\n\n"+Esc.TextAlignCenter+m_dtl.street+" "+m_dtl.city+"\n"+Esc.TextAlignCenter+m_dtl.state+" "+m_dtl.post_code+"\n"+Esc.TextAlignCenter+"Phone : "+m_dtl.restaurant_phone+"\n"+Esc.TextAlignCenter+m_dtl.restaurant_slug+"\n\n"+Esc.TextAlignCenter + Esc.DoubleOn + "CUSTOMER COPY"+ Esc.DoubleOff +"\n\n"+ res_copy+"\n";
	var print_dtl = Esc.InitializePrinter +Esc.DoubleOn+ Esc.TextAlignCenter +"Cuisine.je\n\n" + Esc.DoubleOff + merchant_details+"\n\n"+ print_cnt + res_footer+ Esc.PrintAndFeedMaxLine +  Esc.LF + Esc.PartialCutPaper + Esc.LF;

	print_dtl += Esc.InitializePrinter + Esc.DoubleOn+Esc.TextAlignCenter+"RESTAURANT COPY\n\n" + Esc.DoubleOff + res_copy+"\n------- ----------------------- --------\n"+print_cnt+"\n------- ----------------------- --------\n"+res_copy_pay + Esc.PrintAndFeedMaxLine + Esc.LF  +  Esc.PartialCutPaper+Esc.LF;

	var kit_dtl = Esc.TextAlignCenter + $("#order-details").children().eq(0).find('.text-right').html()+"\n"+Esc.TextAlignLeft +"Customer Name:"+ $("#order-details").children().eq(1).text()+"\n------- ----------------------- --------\n";

	print_dtl += Esc.InitializePrinter+Esc.DoubleOn+Esc.TextAlignCenter+"Kitchen COPY\n" + Esc.DoubleOff +kit_dtl + kit_copy +"\n\n"+ Esc.PrintAndFeedMaxLine + Esc.LF + Esc.FullCutPaper+Esc.LF;
	setTimeout(function(){
		var uint8array = new TextEncoder('utf-8', { NONSTANDARD_allowLegacyEncoding: true }).encode(print_dtl);
     bt.write(uint8array.buffer, deviceId,1);	
	 //setTimeout(function(){window.location.reload();},1000);
	 setTimeout(function(){
	kloader.show();	 
	 var options = {animation: 'none',onTransitionEnd: function() {}};
	 kNavigator.resetToPage('slidemenu.html',options);
	 },1000);
	},2000);
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
					Esc.TextAlignLeft + $("#order-details-item").find('ons-list-item:eq(4) .row .undefined').html()+"                        " + Esc.TextAlignRight + $("#order-details-item").find('ons-list-item:eq(4) .row .text-right').html()+"\n\n"+Esc.DoubleWidth+$("#order-details-item").find('ons-list-header:eq(2) .row ons-col:first-child').html()+"      "+$("#order-details-item").find('ons-list-header:eq(2) .row .text-right').html()+"\n\n\n"+Esc.PrintAndFeedMaxLine + Esc.CutAndFeedLine();

   print(print_dtl);

  // bt.write($("#order-details-item").html(), 'E4:7F:B2:6A:E4:61');

}

  function print(content) {
 	  var bt = new bluetooth(0);
	 var chk =  bt.connect('E4:7F:B2:6A:E4:56');
	 if(chk){
      var uint8array = new TextEncoder('utf-8', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
      bt.write(uint8array.buffer, 'E4:7F:B2:6A:E4:56');
	 }
    }