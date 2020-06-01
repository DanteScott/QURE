#include "quredappqure.hpp"

void quredappqure::paytoken(  
                    name from,
                    name to,
                    asset token_amount,
                    const string& memo)
    {
     
       
  if(to != get_self()) return;
  
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
  
  check(get_first_receiver() == currentcfg.waxcontract, "Invalid Token");
  
  auto newuser = _users.find(from.value);
  
  if (newuser == _users.end()){
   //create new user 
      newuser = _users.emplace(from,  [&](auto& new_user) {
      new_user.username = from;
      new_user.balance = token_amount;
      new_user.donations = token_amount*0;
      
    });
  } else {//get existing user
  auto& user = _users.get(from.value, "User does not exist");
  
  //deposit void into bal
  _users.modify(user, get_self(), [&](auto& modified_user) {
  modified_user.balance += token_amount;
    });
  }
      
}
  

void quredappqure::withdrawtokens(  const name  token_contract,
                    const name from,
                    const name to,
                    const asset token_amount,
                    const string memo)
    {

        action(
            permission_level{from, "active"_n},
            token_contract, "transfer"_n,
            std::make_tuple(from, to, token_amount, memo))
            .send();

    }