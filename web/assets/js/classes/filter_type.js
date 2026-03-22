
class FilterType
{
    constructor()
    {
        this.like = {title: 'Contiene', value: 'LIKE'};
        this.equal = {title: 'Igual', value: '='};
        this.not_equal = {title: 'No igual', value: '!='};
        this.in_list = {title: 'En la lista', value: 'IN'};
        this.not_in_list = {title: 'No en la lista', value: 'NOT IN'};
        this.greater = {title: 'Mayor que', value: '>'};
        this.less = {title: 'Menor que', value: '<'};
        this.greater_equal = {title: 'Mayor o igual que', value: '>='};
        this.less_equal = {title: 'Menor o igual que', value: '<='};
        this.array = [this.like, this.equal, this.not_equal, this.in_list, this.not_in_list, this.greater, this.less, this.greater_equal, this.less_equal];
    }
}
