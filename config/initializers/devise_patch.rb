Devise::Models::Authenticatable::ClassMethods.class_eval do
  def auth_param_requires_string_conversion?(value); true; end
end
