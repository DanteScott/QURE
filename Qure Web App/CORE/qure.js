const contractConfig = {
    code: "testquredapp", // change to hodlgod.x
    scope: "testquredapp",
    userTableName: "users",
    lobbyTableName: "lobbies",
    instanceTableName: "instances",
    voidContract: "eosio.token",
    elementContract: "eosio.token", // change to element.x
    eosContract: "eosio.token",
    elemsym: "ELEM" //CHANGE
  };

var user_status = "loggedout";
var userdata = [];
var hospdata = [];
var bountydata = [];
var thisappdata = [];
var mymeetdata = [];
var mymeetapps = [];
var thismeet = [];
var thispartdata = [];
var thisbountydata = [];
var applicant_idx = 0;
var participant_idx = 1;

var beforeresstatus = undefined;
var rpc;
var eos;
var account = { name: "", authority: "active" };
var eostime = parseInt(Date.now() / 1000);
var usereosdata;

var login_wax_btn = new Vue({
    el: '#iPhone_XR_XS_Max_11___21',
    
    data: {
      user_status: 'loggedout',
      userdata: userdata,
      eostime: eostime,
      userbal: usereosdata,
      deposit_amount: "",
      claim_amount: "",
      donate_amount: "",
      bounty_proof_input: "",
      event_name: "",
      start_time: "",
      event_desc: "",
      rules_link: "",
      max_users: "",
      chosen_cat: "",
      recip_name: "No Recipient Chosen",
      chosen_recip: "",
      this_dono_type: "",
      prev_dono_status: "",
      beforeresstatus: "",
      hosp_list: [],
      hosp_list_length: undefined,
      selected_hosp: 1,
      prev_status: undefined,
      thishospdata: undefined,
      current_hosp: undefined,
      this_meet_time: undefined,
      bounty_list: [],
      bounty_list_length: undefined,
      current_applicant: [],
      current_participant: [],
      participant_idx: 1,
      applicant_idx: 0,
      selected_bounty: 0,
      thisbountydata:undefined,
      current_bounty: [],
      bounty_name: "",
      bounty_max_hunters: "",
      bounty_desc: "",
      queried_meets: [],
      my_meet_apps: [],
      bounty_winners: [""],
      this_meet: undefined,
      mymeetdata: [],
      loading_status: "loading",
      user_manage: 0,
      result_is: 0,
      donoHover: 0,
      confirmHover: 0,
      denyHover: 0,
      fadeOutAnim: 0,
      app_idx: 0
    },
    mounted:function(){
      this.onpageboot() //method1 will execute at pageload

      setTimeout(() => this.fadeOutAnim = 1, 4000)

        setTimeout(() => this.loading_status = 'notloading', 5000)
      
},
    // define methods under the `methods` object
    methods: {
      updateloop: async function (event) {
         
        await getUser();
        await getHospitals();
        await getBounties();
        

        this.hosp_list = hospdata;
        this.hosp_list_length = hospdata.length;
        this.bounty_list = bountydata;
        this.bounty_list_length = bountydata.length;

        //await getCurrentApplicant(0);

       // this.current_applicant = thisappdata;
        
        if (userdata.length != 0) {

            if (userdata[0].username === account.name) {
                await getCoinData();
                this.userbal = usereosdata.toString() + " WAX";
                this.userdata = userdata[0]
                this.userdata.donations = parseFloat(this.userdata.donations).toFixed(2) + " WAX";
                this.userdata.score = parseFloat(this.userdata.score);

                //this.user_status = 'loggedin'
                
                if(userdata[0].current_meet != 0){
                  await getMyMeet();
                  if(userdata[0].hosted_meet != 0){
                  await getMyMeetApplicants();
                  this.my_meet_apps = mymeetapps;
                  }
                  this.mymeetdata = mymeetdata;
                  await getCurrentParticipant(this.participant_idx);

                  this.current_participant = thispartdata[0];
                } else {
                  this.mymeetdata[0] = {};
                  this.mymeetdata[0].event_title = 'You are not in a meet-up..'
                  this.mymeetdata[0].event_category = 'Search'

                }
              
            }else {
                this.user_status = 'loggedin-new-user'
            }
           
          } else {
              this.user_status = 'loggedin-new-user'
          }
          setTimeout(this.updateloop(),5000)
      },
      greet: async function (event) {
        console.log("waxjs ", waxjs);
        const wax = new waxjs.WaxJS("https://chain.wax.io");
        console.log("Wax ", wax);
        account.name = await wax.login();
        console.log("userAccount ", account);
      
        console.log("Wax ", wax);
        rpc = wax.rpc;
        console.log("rpc here ", rpc);
        eos = wax.api;
        console.log("eos here ", eos);

 
        await getUser();
        await getHospitals();
        await getBounties();
        

        this.hosp_list = hospdata;
        this.hosp_list_length = hospdata.length;
        this.bounty_list = bountydata;
        this.bounty_list_length = bountydata.length;

        //await getCurrentApplicant(0);

       // this.current_applicant = thisappdata;
        
        if (userdata.length != 0) {

            if (userdata[0].username === account.name) {
                await getCoinData();
                this.userbal = usereosdata.toString() + " WAX";
                this.userdata = userdata[0]
                this.userdata.donations = parseFloat(this.userdata.donations).toFixed(2) + " WAX";
                this.userdata.score = parseFloat(this.userdata.score);

                this.user_status = 'loggedin'
                
                if(userdata[0].current_meet != 0){
                  await getMyMeet();
                  if(userdata[0].hosted_meet != 0){
                  await getMyMeetApplicants();
                  this.my_meet_apps = mymeetapps;
                  }
                  this.mymeetdata = mymeetdata;
                  await getCurrentParticipant(this.participant_idx);

                  this.current_participant = thispartdata[0];
                } else {
                  this.mymeetdata[0] = {};
                  this.mymeetdata[0].event_title = 'You are not in a meet-up..'
                  this.mymeetdata[0].event_category = 'Search'

                }
              
            }else {
                this.user_status = 'loggedin-new-user'
            }
           
          } else {
              this.user_status = 'loggedin-new-user'
          }


        console.log(user_status)
        console.log(this.user_status)
        this.updateloop();
        /*
        // `this` inside methods points to the Vue instance
        console.log(this.name+" this name")
        // `event` is the native DOM event
        if (event) {
          alert(event.target.tagName)
        }
        */
      },

      onpageboot: async function (event) {
        console.log("waxjs ", waxjs);
        const wax = new waxjs.WaxJS("https://chain.wax.io");
        console.log("Wax ", wax);
        console.log("userAccount ", account);
      
        console.log("Wax ", wax);
        rpc = wax.rpc;
        console.log("rpc here ", rpc);
        eos = wax.api;
        console.log("eos here ", eos);
        await getUser();
        await getHospitals();
        await getBounties();
        
        this.hosp_list = hospdata;
        this.hosp_list_length = hospdata.length;
        this.bounty_list = bountydata;
        this.bounty_list_length = bountydata.length;

        //await getCurrentApplicant(0);

        //this.current_applicant = thisappdata;

      },

      claim: async function(event){
        console.log(this.claim_amount)

        
    this.claim_amount = parseFloat(this.claim_amount);

    var success = 0;
    //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
    await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "claim",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                amount_to_claim: this.claim_amount.toFixed(8) + " WAX"
              }
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
success = 1;
        //success page?
      })
      .catch(function(err) {
        success = 0;
        alert(err);

      });
      await this.respopup(success)
    },

    respopup: async function(event){
      this.beforeresstatus = this.user_status
      this.user_status = "result-true"
      this.result_is = event;
    },

    selwinnerbutton: async function(event){
      console.log(this.bounty_winners)
      var let_continue = 1
      var this_idx = 0;
      for(;this_idx <= this.bounty_winners.length && let_continue === 1; this_idx++){
        if(this.bounty_winners[this_idx] === this.current_applicant.username){
          let_continue = 0
          console.log(this_idx);
        } 
      }
      if(let_continue === 1){
      this.bounty_winners[this.bounty_winners.length-1] = this.current_applicant.username
      this.bounty_winners.length++;
      console.log(this.bounty_winners)
      }
    },

    seldelbutton: async function(event){

      var success = 0;
 //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
  await eos
    .transact(
      {
        actions: [
          {
            account: contractConfig.code,
            name: "hostrepdel",
            authorization: [
              {
                actor: account.name,
                permission: account.authority
              }
            ],
            data: {
              username: account.name,
              delinq_username: this.current_participant.username
            }
          }
        ]
      },
      {
        blocksBehind: 3,
        expireSeconds: 30
      }
    )
    .then(function(res) {
      success = 1;
    })
    .catch(function(err) {
      success = 0;
      console.log(err)
    });
  },
      deposit: async function(event){
        console.log(this.deposit_amount)

        var success = 0;
    this.deposit_amount = parseFloat(this.deposit_amount);
    //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
    await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.eosContract,
              name: "transfer",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                from: account.name,
                to: contractConfig.code,
                quantity: this.deposit_amount.toFixed(8) + " WAX",
                memo: ""
              }
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        success = 1;
      })
      .catch(function(err) {
        success = 0;
      });
      await this.respopup(success)
      },

      firstlogin: async function(event)  {
        var success = 0;
        try {
            
            let response = await eos.transact(
              {
                actions: [
                  {
                    account: contractConfig.code,
                    name: "login",
                    authorization: [
                      {
                        actor: account.name,
                        permission: account.authority
                      }
                    ],
                    data: {
                      username: account.name
                    }
                  }
                ]
              },
              {
                blocksBehind: 3,
                expireSeconds: 30
              }
            );
            console.log("response of hodlLogin ", response);
            //timeToLoad();
            await getUser();
            this.userbal = parseFloat(usereosdata).toFixed(2) + " WAX";
            this.userdata = userdata[0]
            this.user_status = 'loggedin'
            await getCoinData();
            success = 1
           // await this.respopup(success)
          } catch (e) {
            
            //loggedin = false; //(this was originally not here )
            console.log("error in hodlLogin ", e);
          }
          
      },

      bountydonobutton: async function(event){
        console.log(this.donate_amount)

        var success = 0;
    this.donate_amount = parseFloat(this.donate_amount);
    //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
    await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "donate",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                dono_type: "bounty",
                event_id: "",
                bounty_id: this.bounty_list[this.selected_bounty].bounty_host,
                hosp_id: "",
                dono_amount: this.donate_amount.toFixed(8) + " WAX"
              }//(name username, string dono_type, 
   // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        //success page?
        success = 1
      })
      .catch(function(err) {
        alert(err);
      });
      await this.respopup(success)
      },

      openrulesbutton: async function(event){
      window.open(this.this_meet.event_rules, '_blank');
      },

      eventdonobutton: async function(event){
        console.log(this.donate_amount)

        var success = 0;
    this.donate_amount = parseFloat(this.donate_amount);
    //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
    await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "donate",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                dono_type: "event",
                event_id: this.this_meet.unique_id,
                bounty_id: "",
                hosp_id: "",
                dono_amount: this.donate_amount.toFixed(8) + " WAX"
              }//(name username, string dono_type, 
   // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        success = 1;
        //success page?
      })
      .catch(function(err) {
        alert(err);
      });
      await this.respopup(success)
      },
      reqmngbutton: async function(event){

        user_to_manage = mymeetapps[event].username
        var success = 0;
    //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
   await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "reqmng",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                accepted: true,
                selected_user: user_to_manage,
                event_id: userdata[0].hosted_meet
              }//(name username, string dono_type, 
   // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        success = 1;
        //success page?
        console.log(res)
      })
      .catch(function(err) {
        console.log(err);
      });
      await this.respopup(success)
      },

      bountyresbutton: async function(event){

        users_to_manage = this.bounty_winners.toString().split(",")
        users_to_manage.length -= 1;
        var success = 0;
        console.log(users_to_manage) 
    //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
   await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "bountyres",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                winners: users_to_manage
              }//(name username, string dono_type, 
   // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        success = 1;
        //success page?
        console.log(res)
      })
      .catch(function(err) {
        console.log(err);
      });
      await this.respopup(success)
      },

      hospdonobutton: async function(event){
        console.log(this.donate_amount)

        var success = 0;
    this.donate_amount = parseFloat(this.donate_amount);
    //console.log({thiscoincontract, thiscoinchosen, thisdepositvalue})
   await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "donate",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                dono_type: "hospital",
                event_id: "",
                bounty_id: "",
                hosp_id: this.hosp_list[this.selected_hosp].hosp_acc,
                dono_amount: this.donate_amount.toFixed(8) + " WAX"
              }//(name username, string dono_type, 
   // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        success = 1
        //success page?
      })
      .catch(function(err) {
        alert(err);
      });
      await this.respopup(success)
      },

      bountyappbutton: async function(event){
        console.log(this.bounty_proof_input)
        var success = 0;

   await eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "bountyapp",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                bounty_host: this.bounty_list[this.selected_bounty].bounty_host,
                proof_link: this.bounty_proof_input
              }//(name username, string dono_type, 
   // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        success = 1
        //success page?
      })
      .catch(function(err) {
        alert(err);
      });
      await this.respopup(success)
      },
      resmeetbutton: async function(event){
        var success = 0;
  await  eos
      .transact(
        {
          actions: [
            {
              account: contractConfig.code,
              name: "meetres",
              authorization: [
                {
                  actor: account.name,
                  permission: account.authority
                }
              ],
              data: {
                username: account.name,
                is_host: event
              }//(name username, string dono_type, 
   // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then(function(res) {
        success = 1
        //success page?
      })
      .catch(function(err) {
        alert(err);
      });
      await this.respopup(success)
      },

      joinmeetbutton: async function(event){

        var success = 0;
      await  eos
          .transact(
            {
              actions: [
                {
                  account: contractConfig.code,
                  name: "reqjoin",
                  authorization: [
                    {
                      actor: account.name,
                      permission: account.authority
                    }
                  ],
                  data: {
                    username: account.name,
                    event_id: this.this_meet.unique_id
                  }//(name username, string dono_type, 
       // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
                }
              ]
            },
            {
              blocksBehind: 3,
              expireSeconds: 30
            }
          )
          .then(function(res) {
            success = 1
            //success page?
          })
          .catch(function(err) {
            alert(err);
          });
          await this.respopup(success)
          },

          leavemeetbutton: async function(event){

            var success = 0;
         await   eos
              .transact(
                {
                  actions: [
                    {
                      account: contractConfig.code,
                      name: "leavemeet",
                      authorization: [
                        {
                          actor: account.name,
                          permission: account.authority
                        }
                      ],
                      data: {
                        username: account.name
                      }//(name username, string dono_type, 
           // uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);
                    }
                  ]
                },
                {
                  blocksBehind: 3,
                  expireSeconds: 30
                }
              )
              .then(function(res) {
                success = 1
                //success page?
              })
              .catch(function(err) {
                alert(err);
              });
              await this.respopup(success)
              },

      submitmeetbutton: async function(event)  {
        var success = 0;
        try {
            
            let response = await eos.transact(
              {
                actions: [
                  {
                    account: contractConfig.code,
                    name: "createmeet",
                    authorization: [
                      {
                        actor: account.name,
                        permission: account.authority
                      }
                    ],
                    data: {
                      username: account.name,
                      donate_to: this.chosen_recip,
                      event_title: this.event_name,
                      event_desc: this.event_desc,
                      event_rules: this.rules_link,
                      event_category: this.chosen_cat,
                      dono_type: this.this_dono_type,
                      max_participants: this.max_users,
                      start_time: this.start_time
                    }
                  }
                ]
              },
              {
                blocksBehind: 3,
                expireSeconds: 30
              }
            );
//successful meet create
            await getUser();
            success = 1;
            await this.respopup(success)
          } catch (e) {
            
            //loggedin = false; //(this was originally not here )
            console.log("error in hodlLogin ", e);
          }
        
      },
      submitbountybutton: async function(event)  {
        var success = 0;
        try {
            
            let response = await eos.transact(
              {
                actions: [
                  {
                    account: contractConfig.code,
                    name: "initbounty",
                    authorization: [
                      {
                        actor: account.name,
                        permission: account.authority
                      }
                    ],
                    data: {
                      username: account.name,
                      bounty_title: this.bounty_name,
                      bounty_desc: this.bounty_desc,
                      max_hunters: this.bounty_max_hunters
                    }
                  }
                ]
              },
              {
                blocksBehind: 3,
                expireSeconds: 30
              }
            );
//successful meet create
            await getUser();
              success = 1;
              
              await this.respopup(success)
          } catch (e) {
            
            //loggedin = false; //(this was originally not here )
            console.log("error in hodlLogin ", e);
          }
         
      },

      hospitaltime: async function(event) {
        this.prev_status = this.user_status
        await getHospital(this.hosp_list[event].hosp_acc)
        if(this.prev_dono_status === 'loggedin-donos'){
        this.user_status = 'recip-hosp-viewing-donate'
        } else {
        this.user_status = 'recip-hosp-viewing'
        }
        this.current_hosp = thishospdata
        this.selected_hosp = event
        this.chosen_recip = thishospdata.hosp_acc
        this.recip_name = thishospdata.hosp_name
        this.this_dono_type = "hospital"
        //getHospital()
    },

    nextpartbutton: async function(event){
      console.log(this.participant_idx)
      this.participant_idx++
      if(this.participant_idx === thismeet.next_in_queue){
        this.participant_idx = 1;
      }
      participant_idx = this.participant_idx
      await getCurrentParticipant(participant_idx);
      this.current_participant = thispartdata[0];
    },

    prevpartbutton: async function(event){
      console.log(this.participant_idx)
      this.participant_idx--
      if(this.participant_idx === -1){
        this.participant_idx = 0;
      }
      participant_idx = this.participant_idx
      await getCurrentParticipant(participant_idx);
      this.current_participant = thispartdata[0];
    },

    nextappbutton: async function(event){
      console.log(this.applicant_idx)
      this.applicant_idx++
      if(this.applicant_idx === thisbountydata.next_hunter){
        this.applicant_idx = 0;
      }
      applicant_idx = this.applicant_idx
      await getCurrentApplicant(applicant_idx)
      this.current_applicant = thisappdata;
    },

    prevappbutton: async function(event){
      console.log(this.applicant_idx)
      this.applicant_idx--
      if(this.applicant_idx === -1){
        this.applicant_idx = 0;
      }
      applicant_idx = this.applicant_idx
      await getCurrentApplicant(applicant_idx)
      this.current_applicant = thisappdata;
    },

    bountytime: async function(event) {
      this.prev_status = this.user_status
      await getBounty(this.bounty_list[event].bounty_host)
      this.current_applicant = thisappdata;
      if(this.prev_dono_status === 'loggedin-donos'){
        this.user_status = 'recip-bounty-viewing-donate'
      } else {
      this.user_status = 'recip-bounty-viewing'
      }
      this.current_bounty = thisbountydata
      this.selected_bounty = event
      this.chosen_recip = thisbountydata.bounty_host
      this.recip_name = thisbountydata.bounty_title
      this.this_dono_type = "bounty"
    //  await getBountyHost(thisbountydata.bounty_host)
      
      //getHospital()
  },

  hostbountybutton: async function(event){
    if(this.userdata.hosted_bounty === 0){
      this.user_status = 'host-new-bounty'
    } else {
      await getBounty(this.userdata.username)
      this.current_applicant = thisappdata;
      this.current_bounty = thisbountydata
      this.user_status = 'recip-bounty-viewing-donate'
      console.log(this.current_bounty)
    }
  },
      
      donobutton: async function(event)  {
      if(this.user_status != 'loggedout'){
        this.user_status = 'loggedin-donos'
        console.log(this.user_status)
    }
},

findmeetbutton: async function(event)  {
  if(this.user_status != 'loggedout'){
    this.user_status = 'find-new-meetups'
    console.log(this.user_status)
    if(mymeetdata != undefined){
      this.this_meet = mymeetdata[0]
      this.this_meet_time = ((this.this_meet.start_time - eostime)/86,400)
      if(this.this_meet_time < 0){
        this.this_meet_time = "Event Has Began"
      } else {
        this.this_meet_time = this.this_meet_time + " Day(s)"
      }
    }
}
},

    profilebutton: async function(event)  {
        if(this.user_status != 'loggedout'){
        this.user_status = 'loggedin'
        console.log(this.user_status)
    }
    },
    selectcatbutton: async function(event)  {

        this.user_status = 'hosting_meet_sel_cat'

    },
    currentmeetbutton: async function(event)  {
      if(userdata[0].current_meet === 0){
      this.user_status = 'f-m-none-current'
      this.mymeetdata[0].event_title = 'You are not in a meet-up..'
       } else if (userdata[0].hosted_meet === userdata[0].current_meet){
      this.user_status = 'f-m-hosted'
      this.this_meet = mymeetdata[0]
        } else {
          this.user_status = 'f-m-joined'
          this.this_meet = mymeetdata[0]
        }
  },
  selectmeetbutton: async function(meet_idx){
    this.this_meet = this.queried_meets[meet_idx]
    thismeet = this.this_meet
    this.user_status = 'f-m-joined'
  },
    chosencatbutton: async function(choice)  {

        this.chosen_cat = choice
        console.log(this.chosen_cat)
        this.user_status = 'hosting_meetup'
    },
    meetuphospbutton: async function(choice)  {
      this.prev_dono_status = choice
      this.user_status = 'browse_hosps_recip'
  },
  meetupbountybutton: async function(choice)  {
    this.prev_dono_status = choice
    this.user_status = 'browse_bounties_recip'
},
    findcatbutton: async function(choice)  {
      //QUERY meets in selected category
      try {
        let res = await rpc.get_table_rows({
          json: true,
          code: contractConfig.code,
          scope: contractConfig.scope,
          table: 'events',
          index_position: 1,
          key_type: "name",
          limit: 100
        });
    
        var meetdata = res.rows;
        console.log(meetdata);
        
        var thismeetlist = 0
        var meet_idx = 0
        console.log(meet_idx)
        console.log(meetdata[meet_idx].event_category)

        for(; thismeetlist < 8 || meet_idx === meetdata.length; ){
          
          if(meetdata[meet_idx] == undefined || meetdata[meet_idx].event_category === choice){
            this.queried_meets[thismeetlist] = meetdata[meet_idx]
          thismeetlist++;
          }
        meet_idx++;
        }
        console.log(this.queried_meets)

      } catch (e) {
          console.log(e);
      }



      this.finding_cat = choice
      console.log(this.finding_cat)
      this.user_status = 'f-m-category'
  },
    hostmeetupbutton: async function(event) {
        this.user_status = 'hosting_meetup'
    },
    hostmeetuprecipbutton: async function(event) {
        this.user_status = 'hostdonorecip'
        this.chosen_recip = ''
    }

    }
  })

  async function getUser() {
    try {
      let res = await rpc.get_table_rows({
        json: true,
        code: contractConfig.code,
        scope: contractConfig.scope,
        table: contractConfig.userTableName,
        index_position: 1,
        key_type: "name",
        lower_bound: account.name,
        limit: 1
      });
  
      userdata = res.rows;
      console.log(userdata);
      
    } catch (e) {
        console.log(e);
    }
    }
    async function getHospitals() {
      try {
        let res = await rpc.get_table_rows({
          json: true,
          code: contractConfig.code,
          scope: contractConfig.scope,
          table: 'hospitals',
          index_position: 1,
          key_type: "name",
          limit: 50
        });
    
        hospdata = res.rows;
        console.log(res.rows);
        
      } catch (e) {
          console.log(e);
      }
      }
      async function getHospital(this_hosp) {
        try {
          let res = await rpc.get_table_rows({
            json: true,
            code: contractConfig.code,
            scope: contractConfig.scope,
            table: 'hospitals',
            index_position: 1,
            key_type: "name",
            lower_bound: this_hosp,
            limit: 1
          });
      
          thishospdata = res.rows[0];
          console.log(res.rows);
          
        } catch (e) {
            console.log(e);
        }
        }
        async function getBounties() {
          try {
            let res = await rpc.get_table_rows({
              json: true,
              code: contractConfig.code,
              scope: contractConfig.scope,
              table: 'bounties',
              index_position: 1,
              key_type: "name",
              limit: 50
            });
        
            bountydata = res.rows;
            console.log(res.rows);
            
          } catch (e) {
              console.log(e);
          }
          }
          async function getBounty(this_hosp) {
            try {
              let res = await rpc.get_table_rows({
                json: true,
                code: contractConfig.code,
                scope: contractConfig.scope,
                table: 'bounties',
                index_position: 1,
                key_type: "name",
                lower_bound: this_hosp,
                limit: 1
              });
          
              thisbountydata = res.rows[0];
             
              console.log(res.rows);
              
            } catch (e) {
                console.log(e);
            }
            await getCurrentApplicant(applicant_idx);
           
            console.log(this.current_applicant)
            }

    async function getCoinData() {
        var thisusername = userdata[0].username.toString();
      
        //console.log(thisusername)
      
        try {
      
          let resEos = await rpc.get_currency_balance(
            contractConfig.eosContract,
            thisusername,
            "WAX"
          );
      
      console.log(thisusername)
          usereosdata = parseFloat(resEos).toFixed(2);
            console.log(usereosdata);
          if (usereosdata.length === 0) {
            usereosdata = 0;
          }
        } catch (e) {
          console.log("error in getting coin data ", e);
        }
      }

      async function getCurrentApplicant(app_idx){
        try {
          let res = await rpc.get_table_rows({
            json: true,
            code: contractConfig.code,
            scope: contractConfig.scope,
            table: contractConfig.userTableName,
            index_position: 1,
            key_type: "name",
            lower_bound: thisbountydata.app_hunters[app_idx],
            limit: 1
          });
      
          thisappdata = res.rows[0];
          console.log(thisappdata);
          
        } catch (e) {
            console.log(e);
            
            thisappdata.username = "No Applicants";
        }
      }

      async function getCurrentParticipant(part_idx){
        try {
          let res = await rpc.get_table_rows({
            json: true,
            code: contractConfig.code,
            scope: contractConfig.scope,
            table: contractConfig.userTableName,
            index_position: 1,
            key_type: "name",
            lower_bound: thismeet.participants[part_idx],
            limit: 1
          });
      
          thispartdata = res.rows;
          console.log(thispartdata);
          
        } catch (e) {
            console.log(e);
            thispartdata.username = "No Participants";
        }
      }

      async function getMyMeet() {
        try {
          let res = await rpc.get_table_rows({
            json: true,
            code: contractConfig.code,
            scope: contractConfig.scope,
            table: 'events',
            index_position: 1,
            key_type: "i64",
            lower_bound: userdata[0].current_meet,
            limit: 1
          });
      
          mymeetdata = res.rows;
          thismeet = mymeetdata[0];
          console.log(res.rows);
          
        } catch (e) {
            console.log(e);
        }
        }

        async function getMyMeetApplicants() {

          var loop_size = 0;
          if(mymeetdata[0].next_in_queue > 8){
            loop_size = 7;
          } else {
          loop_size = mymeetdata[0].next_in_queue - 1;
          }

          for(ali = 0; loop_size > ali; ali++) {
          try {
            let res = await rpc.get_table_rows({
              json: true,
              code: contractConfig.code,
              scope: contractConfig.scope,
              table: 'users',
              index_position: 1,
              key_type: "name",
              lower_bound: mymeetdata[0].event_reqs[ali+1],
              limit: 1
            });
        
            mymeetapps[ali] = res.rows[0];
           
            
          } catch (e) {
              console.log(e);
          }
        }
        console.log(mymeetapps);
          }

          async function resultPopUp(save_status){
            beforeresstatus = save_status

          }
