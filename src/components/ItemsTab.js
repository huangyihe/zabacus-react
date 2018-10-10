import React from 'react';
import PropTypes from 'prop-types';
import { NewItemForm } from './NewItemForm';
import { ItemList } from './BillItemList';

export const ItemsTab = ({ billId }) => (
  <div className="row-fluid">
    <NewItemForm billId={billId} />
    <ItemList billId={billId} />
  </div>
);

ItemsTab.propTypes = {
  billId: PropTypes.string.isRequired
};