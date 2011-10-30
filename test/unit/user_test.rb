require File.expand_path('../test_helper', File.dirname(__FILE__))

class UserTest < ActiveSupport::TestCase

  test "creates a valid user" do
    assert User.create(:name => 'dan', :email => 'dan@mayerdan.com', :password => 'password', :password_confirmation => 'password')
  end

  test "user needs unique name" do
    User.create!(:name => 'dan', :email => 'dan@mayerdan.com', :password => 'password', :password_confirmation => 'password')
   user = User.create(:name => 'dan', :email => 'dan@mayerdan.com', :password => 'password', :password_confirmation => 'password')
    assert !user.save
  end

end
