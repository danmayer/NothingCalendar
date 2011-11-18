class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation,
  :remember_me, :last_updated, :marks_data, :name

  validates :name, :presence => true
  validates :name, :uniqueness => true

  def self.find_by_id_or_name(param)
    User.find_by_id(param) || User.find_by_name(param)
  end

  def to_param
    "#{id}-#{name.gsub(/[^a-z0-9]+/i, '-')}"
  end

  def as_json(options={})
    super(:only => [:email, :id, :name])
  end

end
