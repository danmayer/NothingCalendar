class AddUserName < ActiveRecord::Migration
  def self.up
     add_column :users, :name, :string
  end

  def self.down
    drop_column :users, :name
  end
end
