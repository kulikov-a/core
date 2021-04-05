<script>
    $( document ).ready(function() {
        $("#grid-templates").UIBootgrid(
            {   search:'/api/diagnostics/lvtemplates/searchItem/',
                get:'/api/diagnostics/lvtemplates/getItem/',
                set:'/api/diagnostics/lvtemplates/setItem/',
                add:'/api/diagnostics/lvtemplates/addItem/',
                del:'/api/diagnostics/lvtemplates/delItem/',
            }
        );
    });
</script>
<table id="grid-templates" class="table table-condensed table-hover table-striped" data-editDialog="DialogTemplate">
    <thead>
        <tr>
            <th data-column-id="uuid" data-type="string" data-identifier="true"  data-visible="false">{{ lang._('ID') }}</th>
            <th data-column-id="name" data-type="string">{{ lang._('Name') }}</th>
            <th data-column-id="filters" data-type="string">{{ lang._('Filters Set') }}</th>
            <th data-column-id="or" data-type="string">{{ lang._('OR global') }}</th>
            <th data-column-id="commands" data-width="7em" data-formatter="commands" data-sortable="false">{{ lang._('Commands') }}</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
    <tfoot>
        <tr>
            <td></td>
            <td>
                <button data-action="add" type="button" class="btn btn-xs btn-default"><span class="fa fa-plus"></span></button>
                <button data-action="deleteSelected" type="button" class="btn btn-xs btn-default"><span class="fa fa-trash-o"></span></button>
            </td>
        </tr>
    </tfoot>
</table>


{{ partial("layout_partials/base_dialog",['fields':formDialogTemplate,'id':'DialogTemplate','label':lang._('Edit template')])}}
