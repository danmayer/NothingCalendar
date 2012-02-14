require File.expand_path('../test_helper', File.dirname(__FILE__))

class ApiRoutesTest < ActiveSupport::TestCase
  include ApiRoutes

  test "index defaults to paths if not passed request" do
    results = ApiRoutes.index
    assert_equal [:routes], results.keys
    assert_equal [:index,:users,:me].sort_by {|sym| sym.to_s}, results[:routes].keys.sort_by {|sym| sym.to_s}
    assert_equal '/users.json', results[:routes][:users]
  end

  test "index full path when passed a request" do
    fake_request = Object.new
    fake_request.stubs(:protocol).returns('http://')
    fake_request.stubs(:host_with_port).returns('test.com')
    results = ApiRoutes.index(fake_request)
    assert_equal [:routes], results.keys
    assert_equal [:index,:users,:me].sort_by {|sym| sym.to_s}, results[:routes].keys.sort_by {|sym| sym.to_s}
    assert_equal 'http://test.com/users.json', results[:routes][:users]
  end

end
