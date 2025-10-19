$(document).ready(function () {
    $.getJSON("./js/productQA.JSON", function (jsonData) {
        $.each(jsonData, function (index, item) {
            var row = $("<tr></tr>");
            var btn=$('<input type="button" class="q" style="width=100%" value='+item.title+'" />');
            row.append($("<th></th>").append(btn));

            var descrow=$("<tr></tr>");
            descrow.append('<td colspan="1" class="desc" style="display:none;">' + item.description + '</td>');
            $("#qabodyput").append(row);

            btn.on("click",function(){
                descrow.find(".desc").toggle();
            });

            $("#qabodyput").append(row);
            $("#qabodyput").append(descrow);
        });
    });
    $("#qabodyput").show();
    $("#qabodyput").attr("border", "0");
});

/**
 * <div id="qabody">
      <table id="qabodyput" width="90%" border="0" style="display: n;"></table>
    </div>
 */