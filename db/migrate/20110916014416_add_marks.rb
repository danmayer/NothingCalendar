class AddMarks < ActiveRecord::Migration
  def self.up
    add_column :users, :marks_data, :text
  end

  def self.down
    drop_column :users, :marks_data
  end
end
