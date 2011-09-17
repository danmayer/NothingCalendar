class AddMarks < ActiveRecord::Migration
  def self.up
    add_column :users, :marks_data, :text
    add_column :users, :last_updated, :timestamp
  end

  def self.down
    drop_column :users, :marks_data
    drop_column :users, :last_updated
  end
end
