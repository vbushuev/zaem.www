//ke window resize
(function () {
	paymentPadding();
	$(window).resize(function () {
		fnDelay(function () {
			paymentPadding();
			$(".calcCounter").remove();
			var arr = (ke.rate == 0.65) ? [50000, 125000, 225000, 300000] : [50000, 400000, 700000, 1000000];
			var padding = (ke.rate == 0.65) ? -1 : -2;
			calcCounts($("#ke_summSlider"), arr);
			$("#ke_summSlider").find(".calcCounter:first").css({
				marginLeft : 1 + "em"
			});
			$("#ke_summSlider").find(".calcCounter:last").css({
				marginLeft : padding + "em"
			});
			calcCounts($("#ke_srokSlider"), [1, 6, 12, 18, 24]);
			$("#ke_srokSlider").find(".calcCounter:first").css({
				marginLeft : 0.25 + "em"
			});
			$("#ke_srokSlider").find(".calcCounter:last").css({
				marginLeft : -0.5 + "em"
			});
		});
	});
	function paymentPadding() {
		if ($(window).width() <= 840) {
			$(".payment").css({
				paddingTop : 0,
				height : 6 + "em"
			});
		} else {
			var h1 = $(".payment").height();
			var h = $(".calc_bars").height();
			$(".payment")
			.height(h)
			.css({
				height : "",
				paddingTop : 37.33 + (h - h1) / 2
			});
		}
	}
})();

//calc ke
$("#ke_summSlider").slider({
	animate : true,
	min : 50000,
	max : 300000,
	range : "min",
	step : 10000,
	value : 300000,
	change : function () {
		ke.reload("slider");
		$("#ke_small_summ").val($("#ke_summ").val());
	}
});
$("#ke_srokSlider").slider({
	animate : true,
	min : 1,
	max : 24,
	range : "min",
	step : 1,
	value : 12,
	change : function () {
		ke.reload("slider");
	}
});
$("#ke_type").change(function () {
	ke.reload("rate");
	$("#ke_small_type").val($("#ke_type").val()).trigger("change");
	$("#ke_summSlider").slider({
		max : (ke.rate == 0.65) ? 300000 : 1000000
	});
	$("#ke_summSlider").find(".calcCounter").remove();
	var arr = (ke.rate == 0.65) ? [50000, 125000, 225000, 300000] : [50000, 400000, 700000, 1000000];
	var padding = (ke.rate == 0.65) ? -1 : -2;
	calcCounts($("#ke_summSlider"), arr);
	$("#ke_summSlider").find(".calcCounter:first").css({
		marginLeft : 1 + "em"
	});
	$("#ke_summSlider").find(".calcCounter:last").css({
		marginLeft : padding + "em"
	});
});
$("#ke_summ").change(function () {
	ke.reload("input");
	$("#ke_small_summ").val($(this).val());
});
$("#ke_srok").change(function () {
	ke.reload("input");
});

$(".ui-slider-handle, ui-corner-all").css({
	backgroundColor : "#3a5c89",
	borderRadius : "10px",
	border : "none",
	marginTop : "1px"
});

//ke calc model
var ke = {
	bail : 0,
	scheludeActive : false,
	counter : 0,
	reload : function (type) {
		this.rate = $("#ke_type").val() == "Без залога" ? 0.65 : 0.5;

		//a+b*0.8=300; a+b*0.7=1000 => a=5900; b=-7000
		$("#ke_summ").attr("max", (5900000 - 7000000 * this.rate));

		if (type == "slider") {
			var summ = $("#ke_summSlider").slider("value");
			var srok = $("#ke_srokSlider").slider("value");
			var plateg = this.pay(summ, srok);
			$("#ke_summ").val(summ);
			$("#ke_srok").val(srok);
		} else {
			var now = $("#ke_summ").val();
			now = Math.max($("#ke_summ").attr("min"), now);
			now = Math.min($("#ke_summ").attr("max"), now);
			$("#ke_summ").val(now);

			now = $("#ke_srok").val();
			now = Math.max($("#ke_srok").attr("min"), now);
			now = Math.min($("#ke_srok").attr("max"), now);

			var summ = $("#ke_summ").val();
			var srok = $("#ke_srok").val();
			$("#ke_summSlider").slider({
				value : summ
			});
			$("#ke_srokSlider").slider({
				value : srok
			});
			var plateg = this.pay(summ, srok);
		}
		$("[name=ke_small_summ]").val(summ);
		var _this = this;
		fnDelay(function () {
			_this.countEffect($("#ke_res"), Math.round(plateg));
			if (_this.scheludeActive) {
				$("#ke_scheludeButton").click();
			}
		}, 200);

	},
	rate : 0.65,
	pay : function (summ, term) {
		var p = this.rate / 12;
		return (summ * p) / (1 - Math.pow((1 + p), -term));
	},
	countEffect : function (obj, res) {
		this.counter++;
		var now = obj.text().replace(" руб.", "");
		now = +now.replaceAll(" ", "");

		if (Math.abs(res - now) > 10 && this.counter < 10) {
			var i = (res - now) / 2;
			obj.text(number_format(now + i, 0, ",", " ") + " руб.");
			var _this = this;
			setTimeout(function () {
				_this.countEffect(obj, res);
			}, 45);
		} else {
			obj.text(number_format(res, 0, ",", " ") + " руб.");
			this.counter = 0;
		}
	}
}

//ke schelude
var ke_schelude_small = false;
$("#ke_scheludeButton").click(function () {
	$(this).hide();
	var s = $("#ke_summSlider").slider("value");
	var t = $("#ke_srokSlider").slider("value");
	var p = ke.rate;
	var pay = ke.pay(s, t);

	var sch = $("#ke_scheludeTable").find("tbody");
	sch.html("");

	var total = [0, 0, 0, 0, 0];

	var dateNow=new Date();
  var daysInMon=[];

  for (var i=1; i<=t; i++){
    var dateLast = dateNow;
    var dateNow = new Date();
    dateNow.setMonth( dateNow.getMonth()+i );
    daysInMon.push( (dateNow - dateLast)/(1000*60*60*24) );
  }

	for (var i = 0; i < t; i++) {
		var arr = [];
		arr[0] = i + 1;
    arr[3] = s * p * ( daysInMon[i]/365 );
		arr[1] = ( i == t-1 ) ? (s+arr[3]) : pay;
		arr[2] = (i == t-1) ? s : arr[1] - arr[3];
		arr[4] = s - arr[2];
		s = s - arr[2];
		tableConstructor(sch, arr);

		for (var j = 0; j < arr.length; j++) {
			total[j] = total[j] + arr[j];
		}
	}

	total[0] = "Итого";
	total[4] = " - ";
	tableConstructor(sch, total, true);

	$("#ke_scheludeTable, #ke_scheludeClose").show();

	$("#ke_scheludeClose").css({
		paddingTop : "0.75em",
		paddingBottom : "0.75em",
	});

	ke.scheludeActive = true;

	function tableConstructor(obj, arr, total) {
		obj.append("<tr></tr>");
		var tr = obj.find("tr:last");
		for (var i = 0; i < arr.length; i++) {
			if (isNaN(+arr[i]) || arr[i] == 0) {
				tr.append("<td>" + arr[i] + "</td>");
			} else {
				tr.append("<td>" + number_format(arr[i], 0, "", " ") + "</td>");
			}
		}
		if (total) {
			tr.addClass("scheludeTotal");
		}
	}
});
$("#ke_scheludeClose").click(function () {
	ke.scheludeActive = false;
	var calcScroll = $("#ke_summ").offset().top;
	$("#ke_scheludeTable, #ke_scheludeClose").hide();
	$('html, body').animate({
		"scrollTop" : calcScroll - 200
	}, 1000);
	$("#ke_scheludeButton").show();
});

//form
$("#ke_small_type").change(function () {
	if ($(this).val() == "Без залога") {
		$("#ke_small_auto").parent().hide();
		$("#ke_small_build").parent().hide();
	} else if ($(this).val() == "Залог недвижимости") {
		$("#ke_small_auto").parent().hide();
		$("#ke_small_build").parent().effect("slide");
	} else {
		$("#ke_small_build").parent().hide();
		$("#ke_small_auto").parent().effect("slide");
	}
});
$("#ke_a_btn_small").click(function () {
	var scroll = $("#ke_form_small").offset().top - 50;
	$('html, body').animate({
		"scrollTop" : scroll
	}, 1000);
	$("#ke_form_small").find(".formTabs").effect("highlight", {
		color : "#d1f0c2"
	}, 1500);
});
$("#personal_data_condition").click(function () {
	var text = $("#template-conditions").html();
	modal.show(text);
});

$("#ke_small_submit").click(function () {
	var inpts = $("#ke_form_small").find("label");
	var arr = [];
	inpts.each(function (indx, element) {
		var inp = $(this).find("input, select");
		if (inp.attr("type") == "checkbox") {
			inp.parent().css({
				backgroundColor : "",
				border : ""
			});
		} else {
			inp.css({
				backgroundColor : "",
				border : ""
			});
		}

		arr.push({
			val : inp.attr("type") == "checkbox" ? inp.prop("checked") : inp.val(),
			name : $(this).find("span").text().replace(":", ""),
			type : inp.attr("type")
		});
	});
	//просто костыли
	arr[arr.length - 1].name = "Согласие на обработку данных";

	var auto = $("#ke_small_type").val() == "Без залога" ? false : true;

	var error = [];
	for (var i = 0; i < arr.length; i++) {
		var checkRes = ke_formValidation(arr[i], auto);
		if (checkRes != "ok") {
			error.push({
				text : arr[i].name + checkRes,
				id : i
			});
		}
	}

	if (error.length == 0) {

		$.post(
			"./server/mail/ke_small.php", {
			loc : encodeURIComponent(window.directory_name),
			from : encodeURIComponent($("#from_mark").val()),
			type : encodeURIComponent($("#ke_small_type").val()),
			auto : encodeURIComponent($("#ke_small_auto").val()),
			summ : encodeURIComponent($("#ke_small_summ").val()),
			phone : encodeURIComponent($("#ke_small_phone").val()),
			name : encodeURIComponent($("#ke_small_name").val())
		},
			function (data) {
			if (data == "ok") {
				$("#ke_form_small").find(".row").hide();
				$("#ke_form_small").find(".formTabs")
				.append("<div id='thx_ke_small'><h2>Спасибо, " + $("#ke_small_name").val() + "!<br/></h2></div>");
				$("#thx_ke_small")
				.append("Заявка успешно отправлена. Наш специалист позвонит Вам по телефону ")
				.append("<em>" + $("#ke_small_phone").val() + "</em> ")
				.append("в ближайшее время.")
				.append("<hr/>Если указанный номер телефона неверный, <a id='return_ke_small_form'>отправте заявку еще раз</a>.");

				$("#return_ke_small_form").click(function () {
					$("#thx_ke_small").remove();
					$("#ke_form_small").find(".row").show();
					inpts.find("input:last").removeAttr("checked");
				});

				$("#ke_form_small").find(".formTabs").effect("highlight", {
					color : "#d1f0c2"
				}, 1500)
				var scroll = $("#ke_form_small").offset().top;
				$('html, body').animate({
					"scrollTop" : scroll - 200
				}, 1000);
			} else {
				modal.show("Что-то пошло не так и заявка не отправлена. Вы можете позвонить по телефону: <span class='white'>" + $("#from_mark").val() + "</span>");
			}
		});
	} else {
		var error_css = {
			backgroundColor : "#fce3bb",
			border : "1px solid red"
		};
		var err_list = "Заполните обязательные поля:<hr/> <ul class='my_ul'>";
		for (var i = 0; i < error.length; i++) {
			if (inpts.eq(error[i].id).find("input").attr("type") == "checkbox") {
				inpts.eq(error[i].id).css(error_css);
			} else {
				inpts.eq(error[i].id).find("input").css(error_css);
			}
			err_list += "<li>" + error[i].text + "</li>";
		}
		err_list += "</ul>";
		modal.show(err_list);
	}
});

function ke_formValidation(obj, auto) {
	var val = obj.val;
	var name = obj.name;
	var type = (obj.type == "text" && name == "Автомобиль") ? "auto" : obj.type;

	switch (type) {
	case 'select':
		return 'ok';
		break;
	case 'number':
		if (parseInt(val.replaceAll(' ', '')) >= 100000) {
			return 'ok';
		} else {
			return ': требуется ввести число, больше 100 000';
		}
		break;

	case 'auto':
		if ((val.replaceAll(' ', '')).length >= 5 || !auto) {
			return 'ok';
		} else {
			return ': недостаточно символов';
		}
		break;

	case 'text':
		if ((val.replaceAll(' ', '')).length >= 2) {
			return 'ok';
		} else {
			return ': недостаточно символов';
		}
		break;

	case 'tel':
		var val_replaced = parseInt(val.replaceAll("+", "").replaceAll(' ', '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', ''));
		if (!isNaN(val_replaced)) {
			if ((val_replaced + "").length >= 7) {
				return 'ok';
			} else {
				return ': недостаточно цифр';
			}
		} else {
			return ': присутствуют недопустимые символы';
		}
		break;
	case 'checkbox':
		if (val == true) {
			return 'ok';
		} else {
			return ': не подтверждено';
		}
		break;
	}
}

//ke callback
$("#ke_faq").click(function () {
	var template = $("#template_ke_faq").html();
	modal.show(template);
});
$("#ke_call_me").click(function () {
	var template = $("#template_call_me").html();
	modal.show(template);
	modal.el.find("a:last").remove();
	modal.el.append('<a class="button" id="call_me_send">Отправить</a>');

	$.get(
		"./server/php/getTime.php", {
		type : "h:m+5"
	},
		function (data) {
		modal.el.find("#call_me_time").val(data);
	});
	modal.el.find("#call_me_phone").inputmask("+7 (999) 999 99 99");

	$("#call_me_day").change(function () {
		if ($(this).val() == "Другой день") {
			$("#call_me_invisible").effect("slide");
		} else {
			$("#call_me_invisible").hide();
		}
	});

	modal.el.find("a").click(function () {
		var error_css = {
			backgroundColor : "#fce3bb",
			border : "1px solid red"
		};
		var ok_css = {
			backgroundColor : "",
			border : ""
		}

		var inpts = modal.el.find("input, select");
		inpts.css(ok_css);
		var inp_arr = [];
		for (var i = 0; i < inpts.length; i++) {
			inp_arr.push(inpts.eq(i).val());
		}

		modal.el.find("span").remove();
		var checkForm = CallMeValidation(inp_arr);

		if (checkForm == "ok") {
			$.post(
				"./server/mail/global_call_me.php", {
				loc : encodeURIComponent(window.directory_name),
				from : encodeURIComponent($("#from_mark").val()),
				phone : encodeURIComponent($("#call_me_phone").val()),
				day : encodeURIComponent($("#call_me_day").val()),
				date : encodeURIComponent($("#call_me_date").val()),
				time : encodeURIComponent($("#call_me_time").val())
			},
				function (data) {
				if (data == "ok") {
					var tel = modal.el.find("#call_me_phone").val();
					modal.show("Заявка на обратный звонок успешно отправлена<br/>Мы свяжемся с Вами по телефону <em>" + tel + "</em> в указанное время.");
				} else {
					modal.show("Что-то пошло не так и заявка не отправлена. Вы можете позвонить по телефону: <span class='white'>" + $("#from_mark").val() + "</span>");
				}
			});
		} else {
			for (var i = 0; i < checkForm.length; i++) {
				if (checkForm[i] != "ok") {
					inpts.eq(i).css(error_css);
					inpts.eq(i).after("<span class='small' style='color: red;'>" + checkForm[i] + "</span>");
				}
			}
		}
	});
});
function CallMeValidation(arr) {
	var newarr = [];
	var val_replaced = parseInt(arr[0].replaceAll("+", "").replaceAll(' ', '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', ''));

	if ((val_replaced + "").length >= 7) {
		newarr.push('ok');
	} else {
		newarr.push(' Недостаточно цифр');
	}

	newarr.push('ok');
	if (arr[1] == 'Другой день') {
		if ((typeof(arr[2]) == 'undefined') || (arr[2] == '')) {
			newarr.push(' Укажите день');
		} else {
			newarr.push('ok');
		}
	} else {
		newarr.push("ok");
	}

	if (typeof(arr[3]) == 'undefined' || arr[3] == '') {
		newarr.push(' Укажите время');
	} else {
		newarr.push('ok');
	}
	validity = true;
	for (i in newarr) {
		if (newarr[i] != 'ok') {
			validity = false;
		}
	}
	if (validity) {
		return 'ok';
	} else {
		return newarr;
	}
}

//ke conditions accordion
$(".accordion").accordion({
	collapsible : true,
	heightStyle : "content",
	active : false,
  animated: "bounceslide"
});

(function () {
	var heads = $(".accordion").find("h4");
	var blocks = $(".accordion").find(".ke_tab");

	heads.click(function () {
		$(this).toggleClass("activeTab");
		var indx = heads.index($(this));
		if (blocks.eq(indx).css("display") == "none") {
			blocks.eq(indx).show();
		} else {
			blocks.eq(indx).hide();
		}
	});

})();

//calc counters
function calcMakeCount(val, obj) {
	var now = obj.slider("value");
	obj
	.slider({
		value : val
	})
	.append("<span class='calcCounter'>" + number_format(val, 0, "", " ") + "</span>");
	var offset = obj.find(".ui-slider-handle").offset();
	var count = obj.find(".calcCounter:last");
	if (offset != undefined) {}
	offset = {
		left : offset.left - count.width() / 4,
		top : offset.top + 25
	}
	obj.slider({
		value : now
	});
	count.offset(offset);
}
function calcCounts(obj, arr) {
	for (var i = 0; i < arr.length; i++) {
		calcMakeCount(arr[i], obj);
	}
}

calcCounts($("#ke_summSlider"), [50000, 125000, 225000, 300000]);
$("#ke_summSlider").find(".calcCounter:first").css({
	marginLeft : 1 + "em"
});
$("#ke_summSlider").find(".calcCounter:last").css({
	marginLeft : -1 + "em"
});
calcCounts($("#ke_srokSlider"), [1, 6, 12, 18, 24]);
$("#ke_srokSlider").find(".calcCounter:first").css({
	marginLeft : 0.25 + "em"
});
$("#ke_srokSlider").find(".calcCounter:last").css({
	marginLeft : -0.5 + "em"
});
