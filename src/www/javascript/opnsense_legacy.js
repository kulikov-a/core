/*
 * Copyright (C) 2015 Deciso B.V.
 * Copyright (C) 2012 Marcello Coutinho
 * Copyright (C) 2012 Carlos Cesario <carloscesario@gmail.com>
 * Copyright (C) 2003-2004 Manuel Kasper <mk@neon1.net>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *    shared components to use with legacy pages
 */

function notice_action(action,msgid) {
  jQuery.ajax({
    type: 'post',
    cache: false,
    url: 'index.php',
    data: {closenotice: msgid},
    success: function(response) {
      jQuery('#menu_messages').html(response);
    }
  });
}

/**
 * hook on change events to network inputs, to maximize the subnet to 24 on ipv4 addresses
 * @param classname: classname to hook on to, select list of netmasks
 * @param data_id: data field reference to network input field
 */
function hook_ipv4v6(classname, data_id)
{
    $("select."+classname).each(function(){
        var selectlist_id = $(this).attr('id');
        if ($(this).data(data_id) != undefined) {
            $("#"+$(this).data(data_id)).change(function () {
                let net = $("#"+selectlist_id).val();
                let type = $(this).data('ipv4v6');
                let val = $(this).val();
                if (val.indexOf(":") != -1) {
                    for (let i = 33; i <= 128; ++i) {
                        $("#"+selectlist_id+' option[value=' + i + ']').show()
                    }
                    if ((type === undefined && val == '') || type === '4') {
                        net = '64';
                    }
                    type = '6';
                } else {
                    if ((type === undefined && val == '') || type === '6') {
                        net = '32';
                    }
                    type = '4';
                    for (let i = 33; i <= 128; ++i) {
                        $("#"+selectlist_id+' option[value=' + i + ']').hide()
                    }
                }
                $("#"+selectlist_id).val(net);
                $(this).data('ipv4v6', type);
                /* when select list uses selectpicker, refresh */
                if ($("#"+selectlist_id).hasClass('selectpicker')) {
                    $("#"+selectlist_id).selectpicker('refresh');
                }
            });
        }
        /* trigger initial onChange event */
        $("#"+$(this).data(data_id)).change();
    });
}

/**
 * transform input forms for better mobile experience (stack description on top)
 * @param match: query pattern to match tables
 */
function hook_stacked_form_tables(match)
{
  $(match).each(function(){
      var root_node = $(this);
      if (root_node.is('table')) {
          let row_number = 0;
          // traverse all <tr> tags
          root_node.find('tr').each(function(){
              // only evaluate children under this table or in <thead|tbody|..> element
              if (root_node.is($(this).parent()) || root_node.is($(this).parent().parent())) {
                  var children = $(this).children();
                  // copy zebra color on striped table
                  if (root_node.hasClass('table-striped')) {
                      if ( $(this).children(0).css("background-color") != 'transparent') {
                          root_node.data('stripe-color', $(this).children(0).css("background-color"));
                      }
                  }
                  if (children.length == 1) {
                      // simple separator line, colspan = 2
                      $(this).before($(this).clone().removeAttr("id").attr('colspan', 1).addClass('hidden-sm hidden-md hidden-lg'));
                      $(this).addClass('hidden-xs');
                  } else if (children.length == 2) {
                      // form input row, create new <tr> for mobile header containing first <td> content
                      var mobile_header = $(this).clone().removeAttr("id").html("").addClass('hidden-sm hidden-md hidden-lg');
                      mobile_header.append($('<td/>').append(children.first().clone(true, true)));
                      // hide "all help" on mobile
                      if (row_number == 0 && $(this).find('td:eq(1) > i').length == 1) {
                          $(this).addClass('hidden-xs');
                      } else {
                          // annotate mobile header with a classname
                          mobile_header.addClass('opnsense-table-mobile-header');
                      }
                      $(this).before(mobile_header);
                      children.first().addClass('hidden-xs');
                  }
                  row_number++;
              }
          });
          // hook in re-apply zebra when table-striped was selected.. (on window resize and initial load)
          if (root_node.data('stripe-color') != undefined) {
              root_node.do_resize = function() {
                  var index = 0;
                  root_node.find('tr:visible').each(function () {
                      $(this).css("background-color", "inherit");
                      $(this).children().css("background-color", "inherit");
                      if (index % 2 == 0) {
                          $(this).css("background-color", root_node.data('stripe-color'));
                      }
                      if (index == 0) {
                          // hide first visible table grid line
                          $(this).find('td, th').css('border-top-width', '0px');
                      }

                      // skip generated mobile headers (group header+content on mobile)
                      if (!$(this).hasClass('opnsense-table-mobile-header')) {
                          ++index;
                      }
                  });
              };
              $( window ).resize(root_node.do_resize);
              root_node.do_resize();
          }
      }
  });
}

/**
 * highlight table option using window location hash
 */
function window_highlight_table_option()
{
    if (window.location.hash != "") {
        let option_id = window.location.hash.substr(1);
        let option = $("[name='" + option_id +"']");
        let arrow = $("<i/>").addClass("fa fa-arrow-right pull-right");
        let container = $("<div/>");
        let title_td = option.closest('tr').find('td:eq(0)');
        container.css('width', '0%');
        container.css('display', 'inline-block');
        container.css('white-space', 'nowrap');

        title_td.append(container);
        let animate_width = title_td.width() - container.position().left+ title_td.find('i:eq(0)').position().left - 1;
        $('html, body').animate({scrollTop: option.position().top}, 500,  function() {
            container.append(arrow);
            container.animate({width: animate_width}, 800);
        });
    }
}


/**
 * load fireall categories and hook change events.
 * in order to use this partial the html template should contain the following:
 * - a <select> with the id "fw_category" to load categories in
 * - <tr/> entities with class "rule" to identify the rows to filter
 * - on the <tr/> tag a data element named "category", which contains a comma seperated list of categories this rule belongs to
 * - a <table/> with id "opnsense-rules" which contains the rules
 */
function hook_firewall_categories() {
    let cat_select = $("#fw_category");
    cats_filter_store = window.location.href.split("/").pop().replace(/\?|\=|\&|\./gi,"_") + "_firewall.selected.categories";
    cats_gr_view = cats_filter_store + "_grview";
    plain_view = true;
    ajaxCall('/api/firewall/category/searchNoCategoryItem', {}, function(data){
        if (data.rows !== undefined && data.rows.length > 0) {
            // attach received data to select. will use later
            cat_select.data("categories", data.rows);
            let color_map = {};
            for (let i=0; i < data.rows.length ; ++i) {
                if (data.rows[i].color != "") {
                    color_map[data.rows[i].name] = data.rows[i].color;
                }
            }
            let category_count = {};
            $(".rule").each(function(){
                let row = $(this);
                $(this).data('category').toString().split(',').forEach(function(item){
                    if (category_count[item] === undefined) {
                        category_count[item] = 0 ;
                    }
                    category_count[item] += 1;
                    let td = row.find('td.rule-description');
                    if (color_map[item] !== undefined) {
                        // suffix category color in the description td
                        if (td.length > 0) {
                            td.append($("<i class='fa fa-circle selector-item'  title='"+item+"'/>").css('color', '#'+color_map[item]));
                        }
                    } else if (item.length > 0) {
                        td.append($("<i class='fa fa-circle-thin selector-item'  title='"+item+"'/>"));
                    }
                });
            });
            for (let i=0; i < data.rows.length ; ++i) {
                let opt_val = $('<div/>').html(data.rows[i].name).text();
                let option = $("<option/>");
                let bgcolor = data.rows[i].color != "" ? data.rows[i].color : '31708f;'; // set category color
                if (category_count[data.rows[i].name] != undefined) {
                    option.data(
                      'content',
                      "<span>"+opt_val + "</span>"+
                      "<span style='background:#"+bgcolor+";' class='badge pull-right'>"+
                      category_count[data.rows[i].name]+"</span>"
                    );
                }
                cat_select.append(option.val(opt_val).html(data.rows[i].name));
            }
        }
        cat_select.selectpicker('refresh');
        // remove text class preventing sticking badges to the right
        $('#category_block  span.text').removeClass('text');
        // hide category search when not used
        if (cat_select.find("option").length == 0) {
            cat_select.addClass('hidden');
        } else {
            let tmp  = [];
            if (window.sessionStorage && window.sessionStorage.getItem(cats_filter_store) !== null) {
                tmp = window.sessionStorage.getItem(cats_filter_store).split(',');
            }
            cat_select.val(tmp);
        }

        cat_select.change(function(){
            if (window.sessionStorage) {
                window.sessionStorage.setItem(cats_filter_store, cat_select.val().join(','));
            }
            let selected_values = cat_select.val();
            let no_cat = cat_select.find("option")[0].value;
            if (plain_view) {
                $(".rule").each(function(){
                    let is_selected = false;
                    $(this).data('category').toString().split(',').forEach(function(item){
                        if (selected_values.indexOf(no_cat) > -1 && item === "") {
                            // No category for this rule
                            is_selected = true;
                        }
                        if (selected_values.indexOf(item) > -1) {
                            is_selected = true;
                        }
                    });
                    if (!is_selected && selected_values.length > 0) {
                        $(this).hide();
                        $(this).find("input.rule_select").prop('disabled', true);
                    } else {
                        $(this).find("input.rule_select").prop('disabled', false);
                        $(this).show();
                    }
                });
            } else {
                // switch to "group" logic
                $(".control_row").each(function() {
                    let cur_toggle = $("a.gr-ctrl-toggler", this);
                    let cur_cat = cur_toggle.data("target");
                    if (selected_values.indexOf(cur_cat) === -1 && selected_values.length > 0) {
                        $(this).hide();
                        //$("tr.rule[data-category_group='" + cur_cat + "']").find("input.rule_select").prop('disabled', true);
                        if (cur_toggle.hasClass("gr-ctrl-opened")) {
                            cur_toggle.click();
                        }
                    } else {
                        $(this).show();
                        //$("tr.rule[data-category_group='" + cur_cat + "']").find("input.rule_select").prop('disabled', false);
                    }
                    // for discussion: should we restore group toggle state if group was hidden and then shown again?
                    // for discussion: should we allow rules mass-select without group expanding?
                });
            }
            $(".opnsense-rules").change();
        });
        cat_select.change();
        $('.selector-item').tooltip();

        // handle "Show by cats".
        // add view toggle button and bind action.
        $("#fw_category").parent().before('<button type="button" id="btn_showbycat" class="btn btn-default hidden-xs pull-right"><i class="fa fa-list-ul" aria-hidden="true" title="Show by categories"></i></button>');
        $("#btn_showbycat").click(function() {
            if (window.localStorage) {
                window.localStorage.setItem(cats_gr_view, !$(this).hasClass("btn-danger"));
            }
            $(this).toggleClass("btn-danger");
            if ($(this).hasClass("btn-danger")) {
                plain_view = false;
                ShowByCat();
            } else {
                location.reload();
            }
        });

        // switch view if needed
        if (window.localStorage && window.localStorage.getItem(cats_gr_view) === "true") {
            $("#btn_showbycat").click();
        }
    });
}

// Nasty way to handle "group by category". Manipulate DOM multiple times to compose new look. Should be better with MVC.
function ShowByCat() {
    // Will store group toggle state in sessionStorage.
    group_expanded = cats_filter_store + "_exp_";

    // Add control column.
    $("table.opnsense-rules:first > tbody > tr").each(function() {
        let r_num = $(this).hasClass("rule") ? $(this).find("input.rule_select").attr("value") : "";
        let r_num_txt = r_num.length > 0 ? "#" + r_num : "";
        $(this).attr("data-i", r_num).prepend('<td class="category_control" style="text-align: center;">' + r_num_txt + '</td>');
    });

    // clone rules with multiple cats. re-apply tooltips inside clone.
    let all_cats = $("#fw_category").data("categories");
    $("table.opnsense-rules > tbody >tr.rule").each(function() {
        let cats = $(this).data("category").split(",");
        let first_cat = cats[0] == "" ? '(No Category)' : cats[0];
        $(this).attr("data-category_group", first_cat);
        if (cats.length > 1) {
            cats.shift();
            let row = $(this);
            $.each(cats, function(i, val) {
                $clone = row.clone(true).attr("data-category_group", val).insertAfter(row);
                $clone.find('i.selector-item').each(function() {
                    $(this).attr("title", $(this).data("originalTitle")).removeAttr("data-original-title").removeData("bs.tooltip");
                    $(this).tooltip();
                });
            })
        }
    });

    // sort rows by category and rule number
    let target = $("table.opnsense-rules tbody").first();
    target.find("tr.rule").sort(function(a, b) {
        let a_cat = $(a).data("category_group").toLowerCase();
        let b_cat = $(b).data("category_group").toLowerCase();
        if (a_cat === b_cat) {
            return parseInt($(a).data('i')) - parseInt($(b).data('i'));
        } else {
            return a_cat.localeCompare(b_cat, undefined, {numeric: true});
        }
    }).appendTo(target);

    // add leading row for each category for collapse/expand button and category color (if any)
    // hide rows after
    $.each(all_cats, function(key, val) {
        $("tr.rule[data-category_group='" + val.name + "']").first().before('<tr class="control_row"><td colspan="100%"><a class="gr-ctrl-toggler gr-ctrl-closed" aria-hidden="true" style="color: unset; cursor: pointer;" data-target="' + val.name + '" data-target_uuid="' + val.uuid + '"><i class="fa fa-plus-square-o"></i> ' + val.name + '</a></td></tr>');
        if (val.color != "") {
            $("a.gr-ctrl-toggler[data-target='" + val.name + "']").after('&nbsp;&nbsp;<i class="fa fa-circle selector-item" title="' + val.name + '" style="color: #' + val.color + ';"></i>');
        } else if (val.uuid.length > 0) {
            $("a.gr-ctrl-toggler[data-target='" + val.name + "']").after('&nbsp;&nbsp;<i class="fa fa-circle-thin selector-item" title="' + val.name + '"></i>');
        }
        $("tr.rule[data-category_group='" + val.name + "']").hide().find("input.rule_select").prop('disabled', true);
    });
    $('.selector-item').tooltip();

    // bind toggler function
    $(".gr-ctrl-toggler").click(function() {
        $(this).children("i").toggleClass("fa-plus-square-o fa-minus-square-o");
        $(this).toggleClass("gr-ctrl-closed gr-ctrl-opened");
        if (window.sessionStorage) {
            window.sessionStorage.setItem(group_expanded + $(this).data("target_uuid"), $(this).hasClass("gr-ctrl-opened"));
        }
        // for discussion: can only select visible rules (expanded group) for damage-proof. or should we allow mass select for all visible groups wihtout expanding them
        if ($(this).hasClass("gr-ctrl-closed")) {
            $("tr.rule[data-category_group='" + $(this).data("target") + "']").hide().find("input.rule_select").prop('disabled', true);
        } else {
            $("tr.rule[data-category_group='" + $(this).data("target") + "']").show().find("input.rule_select").prop('disabled', false);
        }
        $(".opnsense-rules").change();
    });
    
    // to reduce confusion, allow movements only within the group
    $("input.rule_select").click(function() {
        // hide "move" buttons on other groups
        if ($(this).is(':checked')) {
            let c_group = $(this).closest("tr").data("category_group");
            $("tr.rule[data-category_group!='" + c_group + "']").find(".act_move").css("visibility","hidden");
        } else if ($("input.rule_select:checked").length == 0) {
            $(".act_move").css("visibility","");
        }
    });

    // open groups if needed
    $.each(all_cats, function(key, val) {
        if (window.sessionStorage && window.sessionStorage.getItem(group_expanded + val.uuid) === "true") {
            $(".gr-ctrl-toggler[data-target_uuid='" + val.uuid + "']").click();
        }
    });

    // apply filter and adjust stripes
    $("#fw_category").change();
    $(".opnsense-rules").change();
}
