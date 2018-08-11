
$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: '/user/api/v1/contacts',
        success: function (res) {
            $('#u_total_contacts').text(res.length);
            if (res.length > 0) {
                var contact_count = 0;
                for (var i = 0; i < res.length; i++) {
                    let newRow = $('<tr class="table-contact-row">');
                    let cols = "";
                    var phone_list = "", email_list = "";
                    cols += '<td class="col-lg-1 col-md-1 col-sm-1 col-xs-1 "><input type="checkbox" id="u_select_contact' + contact_count + '" name="u_select_contact" class="action-item u_select_contact" value="' + res[i].c_id + '"></td>';
                    cols += '<td class="col-lg-3 col-md-3 col-sm-3 col-xs-4">' + res[i].c_firstname + ' ' + (res[i].c_lastname == null ? '' : res[i].c_lastname) + '</td>';

                    if (res[i].c_phone_no != null) {
                        var phone_count = res[i].c_phone_no.length;
                        if (phone_count === 1) {
                            phone_list = res[i].c_phone_no[0];
                        } else if (phone_count > 1) {
                            for (var j = 0; j < phone_count; j++) {
                                phone_list = phone_list + res[i].c_phone_no[j];
                                if (j !== phone_count - 1) {
                                    phone_list = phone_list + ",";
                                }
                            }
                        } else {
                            phone_list = '';
                        }
                    }
                    cols += '<td class="col-lg-3 col-md-3 col-sm-3 col-xs-6">' + phone_list + '</td>';
                    if (res[i].c_email != null) {
                        var email_count = res[i].c_email.length;
                        if (email_count === 1) {
                            email_list = res[i].c_email[0];
                        } else if (email_count > 1) {
                            for (var k = 0; k < email_count; k++) {
                                email_list = email_list + res[i].c_email[k];
                                if (k !== email_count - 1) {
                                    email_list = email_list + ",";
                                }
                            }
                        } else {
                            email_list = '';
                        }
                    }
                    cols += '<td class="col-lg-4 col-md-4 col-sm-4 hidden-xs">' + email_list + '</td>'

                    cols += '<td class="col-lg-1 col-md-1 col-sm-1 hidden-xs text-center"><button type="button" title="Delete" class="u_delete_contact btn-transparent" data-toggle="modal" data-target="u_modal_delete_contact" data-contactname="' + res[i].c_firstname + '" data-cgroup="' + res[i].c_group + '"><span class="glyphicon glyphicon-trash action-item"></span></button> </td>';
                    newRow.append(cols);
                    newRow.append('</tr>');
                    $("#table_contact").append(newRow);
                    contact_count++;
                }
            }
            $("#table_contact").trigger('update');
        }
    });

    // Table action items

    $(document).on('click', '#u_select_all_contacts', function () {
        var checkBoxes = $('input[name=u_select_contact]');
        checkBoxes.prop("checked", $(this).prop('checked'));
    });

    $(document).on('click', '.u_select_contact', function (event) {
        var $checkbox = $(this);
        setTimeout(function () {
            $checkbox.prop("checked", !$checkbox.prop("checked"));
        }, 0);

        event.preventDefault();
        event.stopPropagation();
    });

    $(document).on('click', '#u_delete_multiple', function () {
        var list = [];
        $('#table_contact tr td input[type="checkbox"]').each(function (index) {
            if (index > 0 && $(this).prop("checked")) {
                list.push($(this).val());
            }
        });

        if (list.length == 0) {
            $('#u_modal_info #u_modal_info_msg').text('No contact selected !');
            $('#u_modal_info').modal('show');
        } else {
            $('#u_modal_delete_contact #u_modal_dc_msg').text(list.length + " contacts");
            $('#u_modal_delete_contact .u_modal_btn_delete_contact').data('cid', list);
            $('#u_modal_delete_contact').modal('show');
        }
    });


    $(document).on('click', '.u_delete_contact', function (event) {
        var name = $(this).data('contactname');
        var cid = $(this).closest('tr').find('td:eq(0) input').val();
        var list = [];
        list.push(cid);
        $('#u_modal_delete_contact #u_modal_dc_msg').text(name);
        $('#u_modal_delete_contact .u_modal_btn_delete_contact').data("cid", list);
        $('#u_modal_delete_contact').modal('show');

        event.preventDefault();
        event.stopPropagation();
    });

    $(document).on('click', '.u_modal_btn_delete_contact', function () {
        var cidList = $(this).data('cid');

        if (cidList.length == 0) return false;

        var listJson;
        listJson = { contacts: cidList };
        listJson = JSON.stringify(listJson);
        $.ajax({
            type: 'DELETE',
            url: '/user/api/v1/contacts',
            data: listJson,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: window.location.reload()
        });
    });

    $(document).on('click', '.table-contact-row', function () {
        var cid = $(this).find('td:eq(0) input').val();
        window.location.href = "/user/contact?id=" + cid;
    });

    // View specified group of contacts

    $("#u_group").change(function () {
        var group = $('#u_group option:selected').text();
        $('#table_contact').show();
        switch (group) {
            case 'All':
                $('#table_contact tbody tr').each(function (i) {
                    $(this).show();
                });
                break;

            case 'Family':
                $('#table_contact > tbody > tr td button').each(function () {
                    $(this).closest('tr').show();
                    if ($(this).data('cgroup') !== 'f') {
                        $(this).closest('tr').hide();
                    }
                });
                break;

            case 'Friends':
                $('#table_contact > tbody > tr td button').each(function () {
                    $(this).closest('tr').show();
                    if ($(this).data('cgroup') !== 'b') {
                        $(this).closest('tr').hide();
                    }
                });
                break;

            case 'Neighbours':
                $('#table_contact > tbody > tr td button').each(function () {
                    $(this).closest('tr').show();
                    if ($(this).data('cgroup') !== 'n') {
                        $(this).closest('tr').hide();
                    }
                });
                break;

            case 'Work':
                $('#table_contact > tbody > tr td button').each(function () {
                    $(this).closest('tr').show();
                    if ($(this).data('cgroup') !== 'w') {
                        $(this).closest('tr').hide();
                    }
                });
                break;

            case 'Places':
                $('#table_contact > tbody > tr td button').each(function () {
                    $(this).closest('tr').show();
                    if ($(this).data('cgroup') !== 'p') {
                        $(this).closest('tr').hide();
                    }
                });
                break;

            case 'Others':
                $('#table_contact > tbody > tr td button').each(function () {
                    $(this).closest('tr').show();
                    if ($(this).data('cgroup') !== 'o') {
                        $(this).closest('tr').hide();
                    }
                });
                break;
        }
        $("#table_contact").trigger('update');
    });
});

//  Search bar
function search_contact() {
    var charCount = document.getElementById('u_search').value.length;
    $('#u_group').val('All');
    if (charCount > 1) {
        var input, filter;
        input = document.getElementById("u_search");
        filter = input.value.toUpperCase().trim();
        table = document.getElementById("table_contact");
        tr = table.getElementsByTagName("tr");
        for (var i = 1; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td");
            if (td[1].innerText.toUpperCase().indexOf(filter) > -1 ||
                td[2].innerText.toUpperCase().indexOf(filter) > -1 ||
                td[3].innerText.toUpperCase().indexOf(filter) > -1
            ) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    } else if (charCount <= 3) {
        $('#table_contact').show();
        $("#table_contact tr").each(function () {
            $(this).show();
        });
    }
    $("#table_contact").trigger('update');
}

// Toggle visibility of elements based on table rows
$('#table_contact').on('update', function () {
    var rc = 0;
    $("#table_contact > tbody > tr").each(function (i) {
        if ($(this).is(':visible')) {
            rc++;
        }
    });
    if (rc === 0) {
        $('#table_contact_no_rows').show();
        $('#table_contact').hide();
        $('#u_total_contacts_row').hide();
        $('#u_delete_multiple').hide();
    } else {
        $('#table_contact_no_rows').hide();
        $('#table_contact').show();
        $('#u_total_contacts_row').show();
        $('#u_delete_multiple').show();
    }
});