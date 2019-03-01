#Allowed fields in config of table

**data** - string, name of field to use on frontend in table engine (dont use "." in this field)

**field** - string, name of field in elasticsearch document

**title** - string, title of column in table

**className** - string, custom css class for table column

**defaultContent** - string, default content for table cell

**orderable** - boolean, should be used order in column, default - true

**searchable** - string, name of field in elasticsearch document for search
> it can be `operator.keyword` or `operator` depend of template for your index

**validation** - function, custom validator to check and prepare data from index on backend side
> if in document exist field with name that the same as `data` then `value` set as `data` value
> else `value` set as all document 
```javascript
{
    validation: (value) => {
        return (typeof  value != "undefined" && value.length > 0) ? value : [];
    }
}
```
default validator is:
```javascript
{
    validation: (value) => {
        return typeof value != 'undefined' ? value : '';
    }
}
```

**render** - custom renderer for table cell
```javascript
{
    render: function (data, type, row) {
        let priorityColor = typeof row['priority_color'] != 'undefined' ? row['priority_color'] : '';
        let circleClassEmpty = priorityColor == 'transparent' ? 'empty' : '';
    
        data = '<span class="circle-status ' + circleClassEmpty + '" style="background-color: ' + priorityColor + '">' + data + '</span>';
    
        return data;
    }
}
```

**orderDefault** - boolean, set true for field wich should use for sorting by default